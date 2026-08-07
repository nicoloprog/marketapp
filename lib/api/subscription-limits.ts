import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const PLAN_LIMITS = {
  beginner: 100,
  standard: 500,
  business: 3000,
} as const;
const YEARLY_MONTHLY_SEARCH_LIMIT = 3000;

export type SubscriptionPlan = keyof typeof PLAN_LIMITS | "custom" | "free";
export type SubscriptionBillingCycle = "monthly" | "yearly";

type ProfileLimitRow = {
  id: string;
  role: string | null;
  is_paid: boolean | null;
  subscription_plan: string | null;
  subscription_billing_cycle: string | null;
  search_limit_override: number | null;
};

type SearchUsageRow = {
  used_count: number | null;
};

export const SUBSCRIPTION_PLAN_OPTIONS = [
  { value: "free", label: "Free", limit: 0 },
  { value: "beginner", label: "Beginner", limit: PLAN_LIMITS.beginner },
  { value: "standard", label: "Standard", limit: PLAN_LIMITS.standard },
  { value: "business", label: "Business", limit: PLAN_LIMITS.business },
  { value: "custom", label: "Custom", limit: null },
] as const;

export function normalizeSubscriptionPlan(value: unknown): SubscriptionPlan {
  const plan = String(value || "free").toLowerCase();
  if (plan === "enterprise") return "business";
  if (
    plan === "beginner" ||
    plan === "standard" ||
    plan === "business" ||
    plan === "custom"
  ) {
    return plan;
  }
  return "free";
}

export function getPlanMonthlyLimit(
  plan: SubscriptionPlan,
  customLimit?: number | null,
  billingCycle?: string | null,
) {
  if (plan === "custom") {
    return Math.max(0, Math.floor(Number(customLimit || 0)));
  }

  if (billingCycle === "yearly" && plan !== "free") {
    return YEARLY_MONTHLY_SEARCH_LIMIT;
  }

  if (plan === "free") return 0;
  return PLAN_LIMITS[plan];
}

function getCurrentUsageMonth() {
  return new Date().toISOString().slice(0, 7);
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function limitHeaders(limit: number, used: number, remaining: number) {
  return {
    "X-Search-Limit": String(limit),
    "X-Search-Used": String(used),
    "X-Search-Remaining": String(Math.max(0, remaining)),
  };
}

function isMissingBillingCycleColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const record = error as Record<string, unknown>;
  return (
    record.code === "42703" ||
    String(record.message || "").includes("subscription_billing_cycle")
  );
}

export async function enforceSubscriptionSearchLimit(searchType: string) {
  const routeClient = await createRouteClient();
  const {
    data: { user },
    error: userError,
  } = await routeClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Please sign in to search products." },
      { status: 401 },
    );
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "Subscription limits are not configured." },
      { status: 503 },
    );
  }

  let { data: profileData, error: profileError } = await adminClient
    .from("profiles")
    .select("id, role, is_paid, subscription_plan, subscription_billing_cycle, search_limit_override")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && isMissingBillingCycleColumn(profileError)) {
    const fallbackResult = await adminClient
      .from("profiles")
      .select("id, role, is_paid, subscription_plan, search_limit_override")
      .eq("id", user.id)
      .maybeSingle();

    profileData = fallbackResult.data as typeof profileData;
    profileError = fallbackResult.error;
  }

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 },
    );
  }

  const profile = profileData as ProfileLimitRow | null;
  const role = String(profile?.role || user.app_metadata?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const plan = normalizeSubscriptionPlan(profile?.subscription_plan);
  const limit = getPlanMonthlyLimit(
    plan,
    profile?.search_limit_override,
    profile?.subscription_billing_cycle,
  );
  const usageMonth = getCurrentUsageMonth();

  if (!isAdmin && limit <= 0) {
    return NextResponse.json(
      {
        error: "Your subscription does not include product searches.",
        plan,
        limit,
        used: 0,
        remaining: 0,
      },
      { status: 402, headers: limitHeaders(limit, 0, 0) },
    );
  }

  const { data: usageData, error: usageError } = await adminClient
    .from("monthly_search_usage")
    .select("used_count")
    .eq("user_id", user.id)
    .eq("usage_month", usageMonth)
    .maybeSingle();

  if (usageError) {
    return NextResponse.json({ error: usageError.message }, { status: 500 });
  }

  const used = Number((usageData as SearchUsageRow | null)?.used_count || 0);
  if (!isAdmin && used >= limit) {
    return NextResponse.json(
      {
        error: "Monthly search limit reached.",
        plan,
        limit,
        used,
        remaining: 0,
      },
      { status: 402, headers: limitHeaders(limit, used, 0) },
    );
  }

  const nextUsed = used + 1;
  const { error: upsertError } = await adminClient
    .from("monthly_search_usage")
    .upsert(
      {
        user_id: user.id,
        usage_month: usageMonth,
        used_count: nextUsed,
        last_search_type: searchType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,usage_month" },
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return null;
}
