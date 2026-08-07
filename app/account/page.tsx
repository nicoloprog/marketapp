"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  Car,
  Crown,
  HardHat,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { BillingPortalButton } from "@/components/billing-portal-button";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";

type UsageSummary = {
  plan: "free" | "beginner" | "standard" | "business" | "custom";
  limit: number;
  used: number;
  remaining: number;
  usageMonth: string;
  stripeSubscriptionStatus: string | null;
};

const planLabels: Record<UsageSummary["plan"], string> = {
  free: "Free",
  beginner: "Beginner",
  standard: "Standard",
  business: "Business",
  custom: "Custom",
};

function DetailTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-semibold text-white">
        {value}
      </p>
      {helper ? <p className="mt-1 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.07]"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const percent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-300 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{percent}%</span>
        <span>
          {used} / {limit}
        </span>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, profile, isAdmin, isPaid, loading, logout } = useAuth();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    const loadUsage = async () => {
      setUsageLoading(true);

      try {
        const res = await fetch("/api/account/usage", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to load account usage.");
        }

        if (!ignore) {
          setUsage(data);
        }
      } catch {
        if (!ignore) {
          setUsage(null);
        }
      } finally {
        if (!ignore) {
          setUsageLoading(false);
        }
      }
    };

    void loadUsage();

    return () => {
      ignore = true;
    };
  }, [user]);

  const plan =
    usage?.plan || (user?.subscriptionPlan as UsageSummary["plan"]) || "free";
  const planLabel = planLabels[plan] || "Free";
  const displayName = user?.name || profile?.name || "BanditPrice Member";
  const statusLabel = usage?.stripeSubscriptionStatus
    ? usage.stripeSubscriptionStatus.replaceAll("_", " ")
    : isPaid
      ? "actif"
      : "inactif";

  const usagePercent = useMemo(() => {
    if (!usage || usage.limit <= 0) return 0;
    return Math.min(100, Math.round((usage.used / usage.limit) * 100));
  }, [usage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#07111f_0%,#0f172a_52%,#020617_100%)]" />

      <SiteHeader />

      <main className="relative z-10 flex-1 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-lg border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.35)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <UserCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className=" text-3xl font-bold tracking-tight sm:text-4xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Modifiez vos informations de compte, gérez votre abonnement
                    et consultez votre utilisation mensuelle.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {isAdmin ? (
                  <Button
                    asChild
                    className="rounded-lg bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    <Link href="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="rounded-lg border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    {isPaid ? (
                      <Crown className="h-5 w-5" />
                    ) : (
                      <BadgeCheck className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Abonnement</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Paramètres de votre abonnement et statut actuel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <DetailTile label="Plan" value={planLabel} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {isPaid ? (
                  <BillingPortalButton className="rounded-lg border-cyan-300/30 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                    Gérer mon abonnement
                  </BillingPortalButton>
                ) : (
                  <Button
                    asChild
                    className="rounded-lg bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    <Link href="/subscriptions">Choisir un plan</Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white"
                >
                  <Link href="/subscriptions">Améliorer mon plan</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Utilisation des recherches
                  </h2>
                  <p className="text-sm text-slate-400">
                    Recherches mensuelles comptabilisées sur l'application.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {usageLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement de l'utilisation...
                  </div>
                ) : usage && usage.limit > 0 ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-4xl font-bold tracking-tight">
                        {usage.remaining}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        recherches restantes dans {usage.usageMonth}
                      </p>
                    </div>
                    <UsageBar used={usage.used} limit={usage.limit} />
                    <p className="text-xs text-slate-500">
                      {usagePercent >= 90
                        ? "Vous êtes proche de votre limite mensuelle."
                        : "L'utilisation est réinitialisée automatiquement chaque mois."}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
                    Abonnez-vous
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailTile
              label="Courriel"
              value={user.email || "Not available"}
            />
            <DetailTile
              label="Identifiant de compte"
              value={user.id.slice(0, 8).toUpperCase()}
            />
          </section>

          <section className="rounded-lg border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Outils</h2>
                <p className="text-sm text-slate-400">
                  Découvrez les outils et fonctionnalités disponibles pour
                  améliorer votre expérience sur BanditPrice.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <QuickLink
                href="/shop"
                label="Vehicle parts"
                description="Search parts by VIN or vehicle details."
                icon={Car}
              />
              <QuickLink
                href="/construction"
                label="Materials"
                description="Compare construction material prices."
                icon={HardHat}
              />
              <QuickLink
                href="/articles"
                label="Products"
                description="Search general products and compare stores."
                icon={Search}
              />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
