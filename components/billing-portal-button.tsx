"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function BillingPortalButton({
  children = "Manage billing",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Stripe billing portal is unavailable.");
      }

      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Stripe billing portal is unavailable.",
      );
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={openPortal}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
      {children}
    </Button>
  );
}
