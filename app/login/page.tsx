"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { SsoButtonGroup } from "@/components/auth/sso-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Connexion reussie");
      const next = searchParams.get("next");
      const safeNext =
        next?.startsWith("/") && !next.startsWith("//") ? next : null;

      router.replace(result.redirectTo === "/admin" ? "/admin" : safeNext ?? result.redirectTo ?? "/");
      router.refresh();
    } else {
      setError(result.message);
      toast.error(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081426] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,#081426_0%,#10244a_48%,#07111f_100%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Connexion
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Accédez à votre compte pour continuer vos recherches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-100"
            >
              Courriel
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Entrez votre courriel"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-lg border-white/10 bg-white/10 text-white placeholder:text-slate-400 focus-visible:ring-cyan-300/40"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-100"
              >
                Mot de passe
              </label>
              <Link
                href="/login"
                className="text-sm font-medium text-blue-400 transition hover:text-cyan-100 hover:underline"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-white/10 bg-white/10 pr-11 text-white placeholder:text-slate-400 focus-visible:ring-cyan-300/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-white"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-50">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
            >
              {submitting ? "Connexion..." : "Connexion"}
            </Button>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            ou
          </span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <SsoButtonGroup type="login" />

        <p className="mt-5 text-center text-sm text-slate-300">
          Pas encore de compte?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-400 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
