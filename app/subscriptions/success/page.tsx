"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshUser } = useAuth();
  const hasSynced = useRef(false);
  const [status, setStatus] = useState<"syncing" | "ready" | "error">(
    "syncing",
  );
  const [message, setMessage] = useState(
    "Validation de votre abonnement Stripe...",
  );

  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    if (!sessionId) {
      setStatus("error");
      setMessage(
        "Session Stripe introuvable. Ouvrez votre compte pour vérifier votre abonnement.",
      );
      return;
    }

    const syncSubscription = async () => {
      try {
        const response = await fetch("/api/stripe/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ sessionId }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.isPaid) {
          throw new Error(
            payload.error ||
              "Votre abonnement n'est pas encore actif. Réessayez dans quelques secondes.",
          );
        }

        await refreshUser();
        router.refresh();
        setStatus("ready");
        setMessage(
          "Votre abonnement est actif. Vous pouvez maintenant accéder à l'application.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Impossible de synchroniser votre abonnement.",
        );
      }
    };

    void syncSubscription();
  }, [refreshUser, router, sessionId]);

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300">
          {status === "syncing" ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <CheckCircle2 className="h-7 w-7" />
          )}
        </div>
        <h1 className="mt-6 text-3xl font-bold">
          {status === "ready" ? "Abonnement activé" : "Validation du paiement"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            disabled={status === "syncing"}
          >
            <Link href="/">Accéder à l'application</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-lg border-white/15 bg-white text-slate-950 hover:bg-slate-200"
          >
            <Link href="/account">Voir mon compte</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
