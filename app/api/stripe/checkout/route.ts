import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const PLAN_PRICE_ENV = {
  monthly: {
    beginner: "STRIPE_PRICE_BEGINNER",
    standard: "STRIPE_PRICE_STANDARD",
    business: "STRIPE_PRICE_BUSINESS",
    enterprise: "STRIPE_PRICE_ENTERPRISE",
  },
  yearly: {
    beginner: "STRIPE_PRICE_BEGINNER_YEARLY",
    standard: "STRIPE_PRICE_STANDARD_YEARLY",
    business: "STRIPE_PRICE_BUSINESS_YEARLY",
    enterprise: "STRIPE_PRICE_ENTERPRISE_YEARLY",
  },
} as const;

type BillingCycle = keyof typeof PLAN_PRICE_ENV;
type PlanKey = keyof typeof PLAN_PRICE_ENV.monthly;

type BillingProfile = {
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status: string | null;
};

function isPlanKey(value: unknown): value is PlanKey {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PLAN_PRICE_ENV.monthly, value)
  );
}

function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

function hasManagedSubscription(status: string | null | undefined) {
  return ["active", "trialing", "past_due", "unpaid"].includes(status || "");
}

async function createBillingPortalSession(
  stripeSecretKey: string,
  customerId: string,
  returnUrl: string,
) {
  const portalParams = new URLSearchParams({
    customer: customerId,
    return_url: returnUrl,
  });

  const portalRes = await fetch(
    "https://api.stripe.com/v1/billing_portal/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: portalParams,
    },
  );

  const portalData = await portalRes.json();

  if (!portalRes.ok) {
    console.error("Stripe billing portal error:", portalData?.error);
    return {
      error:
        portalData?.error?.message ||
        "Unable to open Stripe billing portal. Configure the Customer Portal in Stripe.",
      status: portalRes.status,
    };
  }

  return { url: portalData.url as string };
}

async function createStripeCustomer(
  stripeSecretKey: string,
  userId: string,
  email?: string | null,
) {
  const customerParams = new URLSearchParams({
    "metadata[user_id]": userId,
  });

  if (email) {
    customerParams.set("email", email);
  }

  const customerRes = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: customerParams,
  });

  const customerData = await customerRes.json();

  if (!customerRes.ok) {
    console.error("Stripe customer create error:", customerData?.error);
    return {
      error: customerData?.error?.message || "Unable to create Stripe customer.",
      status: customerRes.status,
    };
  }

  return { customerId: customerData.id as string };
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

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const adminClient = createAdminClient();

  if (!stripeSecretKey || !adminClient) {
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
    return NextResponse.json(
      {
        error: "Please sign in before subscribing.",
        loginUrl: "/login?next=/subscriptions",
      },
      { status: 401 },
    );
  }

  const { data: profileData } = await routeClient
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, stripe_subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as BillingProfile | null;

  const body: unknown = await req.json().catch(() => null);
  const plan = body && typeof body === "object" ? (body as { plan?: unknown }).plan : null;
  const requestedBillingCycle =
    body && typeof body === "object"
      ? (body as { billingCycle?: unknown }).billingCycle
      : null;
  const billingCycle: BillingCycle = isBillingCycle(requestedBillingCycle)
    ? requestedBillingCycle
    : "monthly";

  if (!isPlanKey(plan)) {
    return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
  }

  const normalizedPlan = plan === "enterprise" ? "business" : plan;
  const priceId =
    process.env[PLAN_PRICE_ENV[billingCycle][plan]] ||
    (normalizedPlan === "business"
      ? process.env[PLAN_PRICE_ENV[billingCycle].enterprise]
      : undefined);

  if (!priceId) {
    return NextResponse.json(
      { error: "This subscription plan is not configured." },
      { status: 503 },
    );
  }

  const baseUrl = getBaseUrl(req);

  if (
    profile?.stripe_customer_id &&
    hasManagedSubscription(profile.stripe_subscription_status)
  ) {
    const portalResult = await createBillingPortalSession(
      stripeSecretKey,
      profile.stripe_customer_id,
      `${baseUrl}/subscriptions`,
    );

    if ("error" in portalResult) {
      return NextResponse.json(
        { error: portalResult.error },
        { status: portalResult.status },
      );
    }

    return NextResponse.json({ url: portalResult.url, mode: "portal" });
  }

  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${baseUrl}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/subscriptions/cancel`,
    client_reference_id: user.id,
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    "metadata[plan]": normalizedPlan,
    "metadata[billing_cycle]": billingCycle,
    "metadata[user_id]": user.id,
    "subscription_data[metadata][plan]": normalizedPlan,
    "subscription_data[metadata][billing_cycle]": billingCycle,
    "subscription_data[metadata][user_id]": user.id,
  });

  if (process.env.STRIPE_AUTOMATIC_TAX === "true") {
    params.set("automatic_tax[enabled]", "true");
  }

  let stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    const customerResult = await createStripeCustomer(
      stripeSecretKey,
      user.id,
      user.email,
    );

    if ("error" in customerResult) {
      return NextResponse.json(
        { error: customerResult.error },
        { status: customerResult.status },
      );
    }

    stripeCustomerId = customerResult.customerId;

    const { error: customerSaveError } = await adminClient
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", user.id);

    if (customerSaveError) {
      return NextResponse.json(
        { error: customerSaveError.message },
        { status: 500 },
      );
    }
  }

  params.set("customer", stripeCustomerId);

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await stripeRes.json();

  if (!stripeRes.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Unable to start Stripe checkout." },
      { status: stripeRes.status },
    );
  }

  return NextResponse.json({ url: data.url });
}
