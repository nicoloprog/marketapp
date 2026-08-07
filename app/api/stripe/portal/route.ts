import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type BillingProfile = {
  stripe_customer_id: string | null;
};

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
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

async function findStripeCustomerByEmail(stripeSecretKey: string, email: string) {
  const params = new URLSearchParams({
    email,
    limit: "1",
  });

  const customerRes = await fetch(
    `https://api.stripe.com/v1/customers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
    },
  );

  const customerData = await customerRes.json();

  if (!customerRes.ok) {
    console.error("Stripe customer lookup error:", customerData?.error);
    return null;
  }

  const customer = Array.isArray(customerData?.data)
    ? customerData.data[0]
    : null;

  return typeof customer?.id === "string" ? customer.id : null;
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
      { error: "Please sign in to manage billing." },
      { status: 401 },
    );
  }

  const { data: profileData, error: profileError } = await routeClient
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profile = profileData as BillingProfile | null;
  let stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (!stripeCustomerId && user.email) {
    stripeCustomerId = await findStripeCustomerByEmail(stripeSecretKey, user.email);

    if (stripeCustomerId) {
      const { error: saveError } = await adminClient
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);

      if (saveError) {
        return NextResponse.json({ error: saveError.message }, { status: 500 });
      }
    }
  }

  if (!stripeCustomerId) {
    return NextResponse.json(
      {
        error:
          "No Stripe customer is connected to this account yet. Start a subscription first.",
      },
      { status: 404 },
    );
  }

  const portalParams = new URLSearchParams({
    customer: stripeCustomerId,
    return_url: `${getBaseUrl(req)}/subscriptions`,
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
    return NextResponse.json(
      {
        error:
          portalData?.error?.message || "Unable to open Stripe billing portal.",
      },
      { status: portalRes.status },
    );
  }

  return NextResponse.json({ url: portalData.url });
}
