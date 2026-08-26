import { ArrowRight, BadgeCheck, CirclePlay, Globe2, ShieldCheck, Sparkles } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const frenchPoints = [
  "Comparez rapidement les prix de produits, pièces automobiles et matériaux.",
  "Obtenez des résultats adaptés à votre région lorsque la localisation est autorisée.",
  "Gardez le contrôle avec un compte, un abonnement et une limite de recherches claire.",
];

const englishPoints = [
  "Quickly compare prices for products, vehicle parts, and construction materials.",
  "Get results adapted to your region when location access is enabled.",
  "Stay in control with your account, subscription, and clear monthly search limit.",
];

function VideoPanel({
  label,
  language,
}: {
  label: string;
  language: string;
}) {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-blue-300/15 bg-[#07111f] shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_34%),linear-gradient(135deg,rgba(14,165,233,0.12),transparent_45%)]" />
      <div className="absolute inset-x-6 top-6 flex items-center justify-between">
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur">
          {language}
        </span>
        <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_18px_rgba(134,239,172,0.75)]" />
      </div>

      <div className="relative flex min-h-[280px] items-center justify-center p-8">
        <button
          type="button"
          className="group flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_18px_50px_rgba(14,165,233,0.22)] backdrop-blur transition hover:scale-105 hover:bg-blue-500"
          aria-label={label}
        >
          <CirclePlay className="h-10 w-10 transition group-hover:scale-105" />
        </button>
      </div>

      <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-slate-950/72 p-4 backdrop-blur">
        <p className="text-sm font-semibold text-white">{label}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/5 rounded-full bg-blue-400" />
        </div>
      </div>
    </div>
  );
}

function PointList({ points }: { points: string[] }) {
  return (
    <ul className="mt-7 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex gap-3 text-sm leading-6 text-slate-300">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ExplicationPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Explication en français
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Comprendre BanditPrice en quelques minutes
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              BanditPrice vous aide à trouver rapidement les meilleurs prix en
              regroupant des résultats utiles pour vos achats, vos pièces de
              véhicule et vos matériaux. L'objectif est simple : comparer plus
              vite, choisir plus clairement et éviter de perdre du temps entre
              plusieurs sites.
            </p>
            <PointList points={frenchPoints} />
          </div>

          <VideoPanel
            language="FR"
            label="Présentation BanditPrice en français"
          />
        </section>

        <section className="grid gap-8 border-t border-white/10 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <VideoPanel language="EN" label="BanditPrice overview in English" />

          <div className="lg:pl-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
              <Globe2 className="h-3.5 w-3.5" />
              English explanation
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A clear way to compare prices
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              BanditPrice brings shopping results into one focused experience so
              users can compare offers, review prices, and move toward the
              retailer when they are ready. It is built for simple product
              searches, vehicle-related searches, and construction material
              comparisons.
            </p>
            <PointList points={englishPoints} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-300/20 bg-green-300/10 text-green-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Simple, rapide et pensé pour comparer
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Ajoutez vos vidéos quand elles sont prêtes et gardez cette
                  page comme point d'explication pour les nouveaux utilisateurs.
                </p>
              </div>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-blue-300 sm:block" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
