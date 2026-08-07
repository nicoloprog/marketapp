"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { SsoButtonGroup } from "@/components/auth/sso-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result = await register(email, password, name, confirmPassword);

      setMessage({ text: result.message, success: result.success });

      if (result.success && result.redirectTo) {
        router.replace(result.redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage({ text: "An unexpected error occurred.", success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081426] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,#081426_0%,#10244a_48%,#07111f_100%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-7">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Comparez les prix et découvrez les meilleures offres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {message ? (
            <div
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                message.success
                  ? "bg-emerald-400/15 text-emerald-50"
                  : "bg-red-500/15 text-red-50"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-slate-100"
            >
              Identifiant
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Nom d'utilisateur"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-lg border-white/10 bg-white/10 text-white placeholder:text-slate-400 focus-visible:ring-cyan-300/40"
            />
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-100"
              >
                Mot de passe
              </label>
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
                  onClick={() => setShowPassword((value) => !value)}
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-100"
              >
                Confirmation
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-lg border-white/10 bg-white/10 pr-11 text-white placeholder:text-slate-400 focus-visible:ring-cyan-300/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Création..." : "Continuer"}
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

        <SsoButtonGroup type="register" />

        <p className="mt-5 text-center text-sm text-slate-300">
          Déja un compte?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-400 hover:underline"
          >
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
