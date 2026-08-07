import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  getPlanMonthlyLimit,
  normalizeSubscriptionPlan,
  type SubscriptionPlan,
} from "@/lib/api/subscription-limits";

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  is_paid: boolean | null;
  subscription_plan: string | null;
  subscription_billing_cycle: string | null;
  search_limit_override: number | null;
  updated_at: string | null;
  email: string | null;
};

type UsageRow = {
  user_id: string;
  used_count: number | null;
};

type AdminUser = {
  id: string;
  name: string;
  role: string;
  isPaid: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionBillingCycle: string;
  searchLimitOverride: number | null;
  monthlySearchLimit: number;
  monthlySearchUsed: number;
  updatedAt: string | null;
  email: string | null;
};

function getCurrentUsageMonth() {
  return new Date().toISOString().slice(0, 7);
}

function isMissingBillingCycleColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const record = error as Record<string, unknown>;
  return (
    record.code === "42703" ||
    String(record.message || "").includes("subscription_billing_cycle")
  );
}

function parseAdminPlan(value: unknown): SubscriptionPlan | null {
  const plan = String(value || "").toLowerCase();
  if (plan === "enterprise") return "business";
  if (
    plan === "free" ||
    plan === "beginner" ||
    plan === "standard" ||
    plan === "business" ||
    plan === "custom"
  ) {
    return plan;
  }
  return null;
}

async function createRouteClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function requireAdmin() {
  const routeClient = await createRouteClient();

  const {
    data: { user },
    error: userError,
  } = await routeClient.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await routeClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = String(profile?.role || user.app_metadata?.role || "").toUpperCase();

  if (profileError || role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const adminClient = createAdminClient();
  let { data, error } = await adminClient
    .from("profiles")
    .select(
      "id, name, role, is_paid, subscription_plan, subscription_billing_cycle, search_limit_override, updated_at, email",
    )
    .order("updated_at", { ascending: false });

  if (error && isMissingBillingCycleColumn(error)) {
    const fallbackResult = await adminClient
      .from("profiles")
      .select(
        "id, name, role, is_paid, subscription_plan, search_limit_override, updated_at, email",
      )
      .order("updated_at", { ascending: false });

    data = fallbackResult.data as typeof data;
    error = fallbackResult.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = ((data ?? []) as ProfileRow[]).map((profile) => profile.id);
  const usageMonth = getCurrentUsageMonth();
  const usageByUser = new Map<string, number>();

  if (userIds.length > 0) {
    const { data: usageData, error: usageError } = await adminClient
      .from("monthly_search_usage")
      .select("user_id, used_count")
      .eq("usage_month", usageMonth)
      .in("user_id", userIds);

    if (usageError) {
      return NextResponse.json({ error: usageError.message }, { status: 500 });
    }

    for (const usage of (usageData ?? []) as UsageRow[]) {
      usageByUser.set(usage.user_id, Number(usage.used_count || 0));
    }
  }

  const users: AdminUser[] = ((data ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    name: profile.name?.trim() || "User",
    role: String(profile.role || "USER").toUpperCase(),
    isPaid: Boolean(profile.is_paid),
    subscriptionPlan: normalizeSubscriptionPlan(profile.subscription_plan),
    subscriptionBillingCycle: profile.subscription_billing_cycle || "monthly",
    searchLimitOverride: profile.search_limit_override,
    monthlySearchLimit: getPlanMonthlyLimit(
      normalizeSubscriptionPlan(profile.subscription_plan),
      profile.search_limit_override,
      profile.subscription_billing_cycle,
    ),
    monthlySearchUsed: usageByUser.get(profile.id) ?? 0,
    updatedAt: profile.updated_at,
    email: profile.email,
  }));

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await request.json();
  const userId = String(body.userId || "");
  const nextRole = body.role ? String(body.role).toUpperCase() : undefined;
  const nextName =
    typeof body.name === "string" ? body.name.trim().slice(0, 120) : undefined;
  const nextIsPaid =
    typeof body.isPaid === "boolean" ? body.isPaid : undefined;
  const nextSubscriptionPlan =
    body.subscriptionPlan !== undefined
      ? parseAdminPlan(body.subscriptionPlan)
      : undefined;
  const nextSearchLimitOverride =
    body.searchLimitOverride === null
      ? null
      : body.searchLimitOverride !== undefined
        ? Number(body.searchLimitOverride)
        : undefined;

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  if (nextRole && nextRole !== "ADMIN" && nextRole !== "USER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (nextSubscriptionPlan === null) {
    return NextResponse.json(
      { error: "Invalid subscription plan" },
      { status: 400 },
    );
  }

  if (
    nextSearchLimitOverride !== undefined &&
    nextSearchLimitOverride !== null &&
    (!Number.isFinite(nextSearchLimitOverride) ||
      nextSearchLimitOverride < 0 ||
      nextSearchLimitOverride > 100000)
  ) {
    return NextResponse.json(
      { error: "Custom monthly limit must be between 0 and 100000." },
      { status: 400 },
    );
  }

  if (auth.user.id === userId && nextRole === "USER") {
    return NextResponse.json(
      { error: "You cannot remove your own admin access." },
      { status: 400 },
    );
  }

  if (
    nextRole === undefined &&
    nextName === undefined &&
    nextIsPaid === undefined &&
    nextSubscriptionPlan === undefined &&
    nextSearchLimitOverride === undefined
  ) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const profileUpdate: Record<string, unknown> = {};

  if (nextRole !== undefined) profileUpdate.role = nextRole;
  if (nextName !== undefined) profileUpdate.name = nextName;
  if (nextIsPaid !== undefined) profileUpdate.is_paid = nextIsPaid;
  if (nextSubscriptionPlan !== undefined) {
    profileUpdate.subscription_plan = nextSubscriptionPlan;
    profileUpdate.is_paid = nextSubscriptionPlan !== "free";
    if (nextSubscriptionPlan !== "custom" && nextSearchLimitOverride === undefined) {
      profileUpdate.search_limit_override = null;
    }
  }
  if (nextSearchLimitOverride !== undefined) {
    profileUpdate.search_limit_override =
      nextSearchLimitOverride === null ? null : Math.floor(nextSearchLimitOverride);
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    const currentUserResult = await adminClient.auth.admin.getUserById(userId);

    if (!currentUserResult.error) {
      const existingUser = currentUserResult.data.user;

      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingUser.user_metadata,
          ...(nextName !== undefined ? { name: nextName } : {}),
          ...(nextIsPaid !== undefined ? { is_paid: nextIsPaid } : {}),
          ...(nextSubscriptionPlan !== undefined
            ? { subscription_plan: nextSubscriptionPlan }
            : {}),
          ...(nextSearchLimitOverride !== undefined
            ? { search_limit_override: nextSearchLimitOverride }
            : {}),
        },
        app_metadata: {
          ...existingUser.app_metadata,
          ...(nextRole !== undefined ? { role: nextRole } : {}),
        },
      });
    }
  } catch {
    // The profiles table is the secure source of truth.
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await request.json();
  const userId = String(body.userId || "");

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  if (auth.user.id === userId) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
