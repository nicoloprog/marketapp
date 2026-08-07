import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  Dot,
  Mail,
  Sparkles,
  Zap,
} from "lucide-react";

import { BillingPortalButton } from "@/components/billing-portal-button";
import { SiteHeader } from "@/components/site-layout";
import { SubscriptionCheckoutButton } from "@/components/subscription-checkout-button";
import { Button } from "@/components/ui/button";

const planDetails = [
  {
    key: "beginner",
    name: "Découverte",
    monthlyPrice: "2,99 $",
    description: "Commencez à profiter des meilleurs prix.",
    icon: Sparkles,
    featured: false,
    features: [
      "100 recherches par mois",
      "Comparez les meilleurs prix de votre région et sur Amazon",
    ],
  },
  {
    key: "standard",
    name: "Régulier",
    monthlyPrice: "5,99 $",
    description: "Le meilleur choix pour une utilisation régulières.",
    icon: Zap,
    featured: true,
    features: [
      "500 recherches par mois",
      "Comparez les meilleurs prix de votre région et sur Amazon",
      "Accès aux pièces auto et aux matériaux de construction",
    ],
  },
  {
    key: "business",
    name: "Entreprise",
    monthlyPrice: "19,99 $",
    description: "Adapté aux professionnels et aux besoins plus élevés.",
    icon: Building2,
    featured: false,
    features: [
      "3000 recherches par mois",
      "Comparez les meilleurs prix de votre région et sur Amazon",
      "Adapté aux outils et matériaux de construction",
    ],
  },
] as const;

const yearlyPlan = {
  key: "standard",
  name: "Annuelle",
  price: "199,99 $",
  description:
    "Abonnement à moindre coût par an pour une utilisation régulières.",
  icon: CalendarDays,
  features: [
    "Rabais de 15% par rapport au plan mensuel",
    "3000 recherches par mois",
    "Comparez les meilleurs prix de votre région et sur Amazon",
  ],
} as const;

function PlanCard({
  plan,
  billingCycle,
}: {
  plan: (typeof planDetails)[number];
  billingCycle: "monthly" | "yearly";
}) {
  const Icon = plan.icon;

  return (
    <article
      className={`relative flex min-h-[420px] flex-col rounded-lg border bg-slate-950/80 p-5 ${
        plan.featured ? "border-blue-500/60" : "border-white/10"
      }`}
    >
      {plan.featured ? (
        <div className="absolute right-4 top-4 rounded-full bg-blue-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Populaire
        </div>
      ) : null}

      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-blue-200">
        <Icon className="h-5 w-5" />
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-bold text-white">{plan.name}</h2>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
          {plan.description}
        </p>
      </div>

      <div className="mt-5 flex items-end gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {plan.monthlyPrice}
        </span>
        <span className="pb-1 text-sm text-slate-400">/ mois</span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-200">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <SubscriptionCheckoutButton
        plan={plan.key}
        billingCycle={billingCycle}
        className={`mt-6 w-full rounded-lg ${
          plan.featured
            ? "bg-blue-600 text-white hover:bg-blue-600"
            : "bg-white text-slate-950 hover:bg-slate-200"
        }`}
      >
        Commencer
      </SubscriptionCheckoutButton>
    </article>
  );
}

function YearlyPlanCard() {
  const Icon = yearlyPlan.icon;

  return (
    <article className="relative flex min-h-[420px] flex-col rounded-lg border border-blue-600/60 bg-slate-950/80 p-5">
      <div className="absolute right-4 top-4 rounded-full bg-blue-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
        Annuel
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-blue-200">
        <Icon className="h-5 w-5" />
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-bold text-white">{yearlyPlan.name}</h2>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
          {yearlyPlan.description}
        </p>
      </div>

      <div className="mt-5 flex items-end gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {yearlyPlan.price}
        </span>
        <span className="pb-1 text-sm text-slate-400">/ année</span>
      </div>

      <p className="mt-2 text-xs font-medium text-blue-300">
        Même limite mensuelle que le plan régulier.
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-200">
        {yearlyPlan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <SubscriptionCheckoutButton
        plan={yearlyPlan.key}
        billingCycle="yearly"
        className="mt-6 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        Commencer
      </SubscriptionCheckoutButton>
    </article>
  );
}

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Abonnements
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Selectionnez un plan mensuel ou l'option annuelle avec un paiement
              simple et sécurisé.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-bold text-white">
              Plans mensuels et annuel
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {planDetails.map((plan) => (
              <PlanCard
                key={`monthly-${plan.key}`}
                plan={plan}
                billingCycle="monthly"
              />
            ))}
            <YearlyPlanCard />
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/30 bg-slate-950/80 p-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-200/20 bg-amber-200/10 text-amber-200">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sur mesure</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Une option adaptée au volume éleve, aux besoins spécifique ou
                  aux entreprises. Vous pouvez définir des limites
                  personnalisées, un accompagnement et une configuration adaptée
                  à vos opérations.
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                  {[
                    "Recherche adaptee a vos operations",
                    "Configuration accompagnee",
                    "Limites personnalisees",
                    "Support prioritaire",
                  ].map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-64">
              <div>
                <span className="text-3xl font-bold tracking-tight">
                  Sur devis
                </span>
              </div>
              <Button
                asChild
                className="w-full rounded-lg bg-amber-200 text-slate-950 hover:bg-amber-100"
              >
                <Link href="mailto:thebanditprice@gmail.com?subject=Custom%20BanditPrice%20subscription">
                  <Mail className="h-4 w-4" />
                  Demander un plan
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid w-full gap-3  rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300 md:grid-cols-3">
          <div className="flex items-center md:justify-center gap-2">
            <Dot className="h-6 w-6 text-gray-100" />
            Paiement sécurisé
          </div>
          <div className="flex items-center gap-2">
            <Dot className="h-6 w-6 text-gray-100" />
            Plusieurs options de paiement
          </div>
          <div className="flex items-center gap-2">
            <Dot className="h-6 w-6 text-gray-100" />
            Annulation disponible en tout temps
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Vous avez un abonnement?
            </h2>
            <p className="mt-1 text-slate-400">
              Modifiez votre plan, mettez à jour votre carte, consultez vos
              factures ou annulez.
            </p>
          </div>
          <BillingPortalButton className="w-full border-white/15 bg-white text-slate-950 hover:bg-slate-200 sm:w-auto">
            Modifier mon abonnement
          </BillingPortalButton>
        </section>
      </main>
    </div>
  );
}
