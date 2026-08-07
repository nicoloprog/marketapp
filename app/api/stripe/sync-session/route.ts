import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { normalizeSubscriptionPlan } from "@/lib/api/subscription-limits";

type StripeObject = Record<string, unknown>;

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

function getMetadataValue(object: StripeObject, key: string) {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") return null;

  const value = (metadata as StripeObject)[key];
  return typeof value === "string" ? value : null;
}

function getStringValue(object: StripeObject, key: string) {
  const value = object[key];
  return typeof value === "string" ? value : null;
}

function isMissingBillingCycleColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const record = error as Record<string, unknown>;
  return (
    record.code === "42703" ||
    String(record.message || "").includes("subscription_billing_cycle")
  );
}

async function stripeGet(
  stripeSecretKey: string,
  path: string,
  params?: URLSearchParams,
) {
  const url = `https://api.stripe.com/v1/${path}${
    params ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Unable to verify Stripe session.");
  }

  return data as StripeObject;
}

async function updateProfileSubscription(
  userId: string,
  update: Record<string, unknown>,
) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { error } = await adminClient.from("profiles").update(update).eq("id", userId);

  if (!error) return;

  if (isMissingBillingCycleColumn(error)) {
    const { subscription_billing_cycle, ...fallbackUpdate } = update;
    const fallbackResult = await adminClient
      .from("profiles")
      .update(fallbackUpdate)
      .eq("id", userId);

    if (!fallbackResult.error) return;
    throw fallbackResult.error;
  }

  throw error;
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || !createAdminClient()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const routeClient = await createRouteClient();
  const {
    data: { user },
    error: userError,
  } = await routeClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const sessionId =
    body && typeof body === "object"
      ? (body as { sessionId?: unknown }).sessionId
      : null;

  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid Stripe session." }, { status: 400 });
  }

  const session = await stripeGet(
    stripeSecretKey,
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
  );

  const sessionUserId =
    getStringValue(session, "client_reference_id") ||
    getMetadataValue(session, "user_id");

  if (sessionUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscriptionId = getStringValue(session, "subscription");
  const customerId = getStringValue(session, "customer");

  if (!subscriptionId || !customerId) {
    return NextResponse.json(
      { error: "Stripe subscription is not ready yet." },
      { status: 409 },
    );
  }

  const subscription = await stripeGet(
    stripeSecretKey,
    `subscriptions/${encodeURIComponent(subscriptionId)}`,
    new URLSearchParams({ "expand[]": "items.data.price" }),
  );

  const status = getStringValue(subscription, "status") || "";
  const isPaid = ["active", "trialing", "past_due"].includes(status);
  const plan =
    getMetadataValue(subscription, "plan") ||
    getMetadataValue(session, "plan") ||
    "standard";
  const billingCycle =
    getMetadataValue(subscription, "billing_cycle") ||
    getMetadataValue(session, "billing_cycle") ||
    "monthly";

  await updateProfileSubscription(user.id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_subscription_status: status || (isPaid ? "active" : "incomplete"),
    subscription_plan: isPaid ? normalizeSubscriptionPlan(plan) : "free",
    subscription_billing_cycle: billingCycle === "yearly" ? "yearly" : "monthly",
    is_paid: isPaid,
    search_limit_override: null,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    isPaid,
    status,
    plan: isPaid ? normalizeSubscriptionPlan(plan) : "free",
    billingCycle: billingCycle === "yearly" ? "yearly" : "monthly",
  });
}
