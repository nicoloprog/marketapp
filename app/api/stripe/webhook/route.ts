import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeSubscriptionPlan } from "@/lib/api/subscription-limits";

type StripeEvent = {
  type: string;
  data?: {
    object?: Record<string, unknown>;
  };
};

function getPriceIdToPlan() {
  const entries: Array<[string | undefined, string]> = [
    [process.env.STRIPE_PRICE_BEGINNER, "beginner"],
    [process.env.STRIPE_PRICE_STANDARD, "standard"],
    [process.env.STRIPE_PRICE_BUSINESS, "business"],
    [process.env.STRIPE_PRICE_ENTERPRISE, "business"],
    [process.env.STRIPE_PRICE_BEGINNER_YEARLY, "beginner"],
    [process.env.STRIPE_PRICE_STANDARD_YEARLY, "standard"],
    [process.env.STRIPE_PRICE_BUSINESS_YEARLY, "business"],
    [process.env.STRIPE_PRICE_ENTERPRISE_YEARLY, "business"],
  ];

  return Object.fromEntries(
    entries.filter((entry): entry is [string, string] => Boolean(entry[0])),
  );
}

function getYearlyPriceIds() {
  return new Set(
    [
      process.env.STRIPE_PRICE_BEGINNER_YEARLY,
      process.env.STRIPE_PRICE_STANDARD_YEARLY,
      process.env.STRIPE_PRICE_BUSINESS_YEARLY,
      process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
    ].filter((priceId): priceId is string => Boolean(priceId)),
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

function getMetadataValue(object: Record<string, unknown>, key: string) {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") return null;

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function getUserId(object: Record<string, unknown>) {
  const metadataUserId = getMetadataValue(object, "user_id");
  if (metadataUserId) return metadataUserId;

  const clientReferenceId = object.client_reference_id;
  return typeof clientReferenceId === "string" ? clientReferenceId : null;
}

function getStringValue(object: Record<string, unknown>, key: string) {
  const value = object[key];
  return typeof value === "string" ? value : null;
}

function getSubscriptionPriceId(object: Record<string, unknown>) {
  const items = object.items;
  if (!items || typeof items !== "object") return null;

  const data = (items as Record<string, unknown>).data;
  if (!Array.isArray(data)) return null;

  const firstItem = data[0];
  if (!firstItem || typeof firstItem !== "object") return null;

  const price = (firstItem as Record<string, unknown>).price;
  if (!price || typeof price !== "object") return null;

  const priceId = (price as Record<string, unknown>).id;
  return typeof priceId === "string" ? priceId : null;
}

function getPlanFromObject(object: Record<string, unknown>) {
  const metadataPlan = getMetadataValue(object, "plan");
  if (metadataPlan) return metadataPlan;

  const priceId = getSubscriptionPriceId(object);
  return priceId ? getPriceIdToPlan()[priceId] || null : null;
}

function getBillingCycleFromObject(object: Record<string, unknown>) {
  const metadataBillingCycle = getMetadataValue(object, "billing_cycle");
  if (metadataBillingCycle === "yearly") return "yearly";

  const priceId = getSubscriptionPriceId(object);
  if (priceId && getYearlyPriceIds().has(priceId)) return "yearly";

  return "monthly";
}

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = signatureHeader.split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs)) return false;

  const ageMs = Math.abs(Date.now() - timestampMs);
  if (ageMs > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    const receivedBuffer = Buffer.from(signature, "hex");
    return (
      receivedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  });
}

function isMissingBillingCycleColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const record = error as Record<string, unknown>;
  return (
    record.code === "42703" ||
    String(record.message || "").includes("subscription_billing_cycle")
  );
}

async function findUserIdByStripeReference(
  customerId: string | null,
  subscriptionId: string | null,
) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error("Supabase admin client is not configured.");
  }

  if (subscriptionId) {
    const { data } = await adminClient
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    const userId = (data as { id?: string } | null)?.id;
    if (userId) return userId;
  }

  if (customerId) {
    const { data } = await adminClient
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    const userId = (data as { id?: string } | null)?.id;
    if (userId) return userId;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      const customerRes = await fetch(
        `https://api.stripe.com/v1/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        },
      );

      const customer = await customerRes.json();
      const metadataUserId = getMetadataValue(customer, "user_id");
      if (metadataUserId) return metadataUserId;
    }
  }

  return null;
}

async function updateUserSubscription(
  userId: string,
  planValue: string | null,
  isPaid: boolean,
  stripeData: {
    customerId?: string | null;
    subscriptionId?: string | null;
    status?: string | null;
    billingCycle?: string | null;
  } = {},
) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error("Supabase admin client is not configured.");
  }

  const plan = isPaid ? normalizeSubscriptionPlan(planValue) : "free";

  const update: Record<string, unknown> = {
    subscription_plan: plan,
    subscription_billing_cycle: isPaid
      ? stripeData.billingCycle === "yearly"
        ? "yearly"
        : "monthly"
      : "monthly",
    is_paid: isPaid,
    stripe_subscription_status: stripeData.status || (isPaid ? "active" : "canceled"),
    updated_at: new Date().toISOString(),
  };

  if (stripeData.customerId) {
    update.stripe_customer_id = stripeData.customerId;
  }

  if (stripeData.subscriptionId) {
    update.stripe_subscription_id = stripeData.subscriptionId;
  }

  if (plan !== "custom") {
    update.search_limit_override = null;
  }

  const { error } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", userId);

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await req.text();
  if (!verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const object = event.data?.object;

  if (!object) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const userId = getUserId(object);
    const plan = getPlanFromObject(object);
    const billingCycle = getBillingCycleFromObject(object);
    const customerId = getStringValue(object, "customer");
    const subscriptionId = getStringValue(object, "subscription");

    if (userId && plan) {
      await updateUserSubscription(userId, plan, true, {
        customerId,
        subscriptionId,
        billingCycle,
        status: "active",
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const customerId = getStringValue(object, "customer");
    const subscriptionId = getStringValue(object, "id");
    const userId =
      getUserId(object) ||
      (await findUserIdByStripeReference(customerId, subscriptionId));
    const plan = getPlanFromObject(object);
    const billingCycle = getBillingCycleFromObject(object);
    const status = typeof object.status === "string" ? object.status : "";
    const isPaid =
      event.type !== "customer.subscription.deleted" &&
      ["active", "trialing", "past_due"].includes(status);

    if (userId) {
      await updateUserSubscription(userId, plan, isPaid, {
        customerId,
        subscriptionId,
        billingCycle,
        status: status || (isPaid ? "active" : "canceled"),
      });
    }
  }

  return NextResponse.json({ received: true });
}
