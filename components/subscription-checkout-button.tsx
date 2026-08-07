"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PlanKey = "beginner" | "standard" | "business" | "enterprise";
type BillingCycle = "monthly" | "yearly";

export function SubscriptionCheckoutButton({
  plan,
  billingCycle = "monthly",
  children,
  className,
}: {
  plan: PlanKey;
  billingCycle?: BillingCycle;
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ plan, billingCycle }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.assign("/login?next=/subscriptions");
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Stripe n'est pas disponible.");
      }

      if (data.mode === "portal") {
        toast.info(
          "Ouverture du portail de facturation Stripe. Vous serez redirigé vers Stripe pour gérer votre abonnement.",
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Stripe n'est pas disponible.",
      );
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={startCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
      {children}
    </Button>
  );
}
