import Link from "next/link";
import { ArrowLeftCircle } from "lucide-react";

import { SiteHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-300/15 text-amber-200">
          <ArrowLeftCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Paiement annulé</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Aucun abonnement n'a été activé. Vous pouvez revenir aux options et
          choisir un plan quand vous êtes prêt.
        </p>
        <Button
          asChild
          className="mt-8 rounded-lg bg-white text-slate-950 hover:bg-slate-200"
        >
          <Link href="/subscriptions">Voir les options</Link>
        </Button>
      </main>
    </div>
  );
}
