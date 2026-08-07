import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getPlanMonthlyLimit,
  normalizeSubscriptionPlan,
} from "@/lib/api/subscription-limits";

type ProfileRow = {
  subscription_plan: string | null;
  subscription_billing_cycle: string | null;
  search_limit_override: number | null;
  stripe_subscription_status: string | null;
};

type UsageRow = {
  used_count: number | null;
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

export async function GET() {
  const routeClient = await createRouteClient();
  const {
    data: { user },
    error: userError,
  } = await routeClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { data: profileData, error: profileError } = await routeClient
    .from("profiles")
    .select("subscription_plan, subscription_billing_cycle, search_limit_override, stripe_subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && isMissingBillingCycleColumn(profileError)) {
    const fallbackResult = await routeClient
      .from("profiles")
      .select("subscription_plan, search_limit_override, stripe_subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    profileData = fallbackResult.data as typeof profileData;
    profileError = fallbackResult.error;
  }

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profile = profileData as ProfileRow | null;
  const plan = normalizeSubscriptionPlan(profile?.subscription_plan);
  const limit = getPlanMonthlyLimit(
    plan,
    profile?.search_limit_override,
    profile?.subscription_billing_cycle,
  );
  const usageMonth = getCurrentUsageMonth();

  const { data: usageData, error: usageError } = await routeClient
    .from("monthly_search_usage")
    .select("used_count")
    .eq("user_id", user.id)
    .eq("usage_month", usageMonth)
    .maybeSingle();

  if (usageError) {
    return NextResponse.json({ error: usageError.message }, { status: 500 });
  }

  const used = Number((usageData as UsageRow | null)?.used_count || 0);

  return NextResponse.json({
    plan,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    usageMonth,
    billingCycle: profile?.subscription_billing_cycle || "monthly",
    stripeSubscriptionStatus: profile?.stripe_subscription_status || null,
  });
}
