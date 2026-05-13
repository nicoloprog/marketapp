"use client";

import Link from "next/link";
import { useEffect, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Crown,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Wrench,
  HardHat,
  LayoutDashboard,
} from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store";

function DetailCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/65">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
      {helper ? (
        <p className="mt-1 text-sm text-slate-300/70">{helper}</p>
      ) : null}
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
      className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/30 hover:bg-white/[0.07]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-sky-400/10 p-2 text-sky-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm text-slate-300/70">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function AccountPage() {
  const { user, profile, isAdmin, isPaid, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.name || profile?.name || "BanditPrice Member";
  const displayRole = isAdmin ? "Administrateur" : "Utilisateur";
  const membership = isPaid ? "Membre Premium" : "Accès gratuit";

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(56,189,248,0.14) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <SiteHeader />

      <main className="relative z-10 flex-1 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-sky-400/10 p-4 text-sky-300">
                  <UserCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    My Account
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300/75 sm:text-base">
                    Gérez votre accès, consultez votre statut et retrouvez
                    rapidement les sections importantes de l’application.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {isAdmin ? (
                  <Link href="/admin">
                    <Button className="w-full rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 sm:w-auto">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="w-full rounded-xl border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard
              label="Email"
              value={user.email || "Not available"}
              helper="Adresse reliée à votre compte"
            />
            <DetailCard
              label="Role"
              value={displayRole}
              helper={
                isAdmin
                  ? "Accès étendu aux outils admin"
                  : "Accès standard à la plateforme"
              }
            />
            <DetailCard
              label="Membership"
              value={membership}
              helper={
                isPaid
                  ? "Les recherches premium sont actives"
                  : "Passez premium pour débloquer les recherches avancées"
              }
            />
            <DetailCard
              label="User ID"
              value={user.id.slice(0, 8).toUpperCase()}
              helper="Identifiant interne du compte"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
                  {isPaid ? (
                    <Crown className="h-5 w-5" />
                  ) : (
                    <BadgeCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Account Status
                  </h2>
                  <p className="text-sm text-slate-300/70">
                    Un aperçu clair de votre accès actuel.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-200">
                    {isPaid ? "Premium actif" : "Plan gratuit"}
                  </p>
                  <p className="mt-2 text-sm text-emerald-100/80">
                    {isPaid
                      ? "Vos recherches premium et accès payants sont disponibles."
                      : "Certaines recherches restent verrouillées tant que le plan premium n’est pas activé."}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 p-4">
                  <p className="text-sm font-semibold text-sky-100">
                    Sécurité du compte
                  </p>
                  <p className="mt-2 text-sm text-sky-50/75">
                    Votre session est liée à Supabase Auth et votre rôle est
                    synchronisé avec votre profil.
                  </p>
                </div>
              </div>

              {!isPaid ? (
                <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50/85">
                  Passez à un accès payant pour déverrouiller l’expérience de
                  recherche complète dans l’application.
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-400/10 p-2 text-sky-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Quick Access
                  </h2>
                  <p className="text-sm text-slate-300/70">
                    Vos raccourcis utiles.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <QuickLink
                  href="/shop"
                  label="Pièces véhicules"
                  description="Retournez à la recherche automobile."
                  icon={Wrench}
                />
                <QuickLink
                  href="/construction"
                  label="Matériaux"
                  description="Reprenez votre recherche de matériaux."
                  icon={HardHat}
                />
                {isAdmin ? (
                  <QuickLink
                    href="/admin/users"
                    label="Gestion utilisateurs"
                    description="Accédez rapidement au contrôle admin."
                    icon={LayoutDashboard}
                  />
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
