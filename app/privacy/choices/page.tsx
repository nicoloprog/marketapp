import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const rights = [
  "Accéder aux renseignements personnels que nous traitons à votre sujet ou savoir quels renseignements personnels nous traitons.",
  "Demander la correction de renseignements personnels inexacts.",
  "Demander la suppression de renseignements personnels, sous réserve des besoins de conservation juridiques, de sécurité, de facturation, de prévention de la fraude et opérationnels.",
  "Demander une copie portable des renseignements lorsque la loi l'exige.",
  "Vous opposer à certains traitements ou en restreindre certains lorsque cela est applicable.",
  "Retirer votre consentement au traitement optionnel de la localisation en modifiant l'autorisation du navigateur ou les préférences de localisation de l'application.",
  "Vous opposer à la vente ou au partage de renseignements personnels. BanditPrice ne vend actuellement pas de renseignements personnels et ne les partage pas intentionnellement à des fins de publicité comportementale intercontextuelle.",
  "Limiter l'utilisation des renseignements personnels sensibles lorsque cela est applicable. BanditPrice n'utilise pas les renseignements personnels sensibles pour déduire des caractéristiques.",
];

export default function PrivacyChoicesPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-lg border border-white/10 bg-slate-950/75 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                BanditPrice
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Choix de confidentialité
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Date d'entrée en vigueur : 15 juillet 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Utilisez cette page pour comprendre et exercer les choix de
            confidentialité disponibles en vertu de lois comme le RGPD, le RGPD
            du Royaume-Uni, la CCPA/CPRA et les lois régionales similaires sur
            la confidentialité.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Vos droits</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            {rights.map((right) => (
              <li key={right} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                <span>{right}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Soumettre une demande</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Envoyez-nous un courriel à{" "}
            <a
              href="mailto:thebanditprice@gmail.com?subject=Privacy%20Request"
              className="font-semibold text-cyan-200 underline"
            >
              thebanditprice@gmail.com
            </a>{" "}
            avec l'objet « Demande de confidentialité ». Incluez l'adresse
            courriel utilisée pour votre compte BanditPrice et le droit que vous
            souhaitez exercer. Nous pourrions devoir vérifier votre identité
            avant de traiter la demande.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Les agents autorisés de Californie peuvent soumettre des demandes à
            la même adresse courriel. Nous pouvons exiger une preuve
            d'autorisation et une vérification d'identité conformément à la loi
            applicable.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Cookies et localisation</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Vous pouvez supprimer les cookies BanditPrice dans votre navigateur
            pour réinitialiser le consentement et les préférences de
            localisation. Vous pouvez révoquer l'accès à la géolocalisation du
            navigateur dans les paramètres de votre navigateur ou de votre
            système d'exploitation. Si vous révoquez l'accès à la localisation,
            vous pouvez tout de même sélectionner une localisation manuellement
            lorsque l'application offre cette option.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Vente ou partage</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            BanditPrice ne vend actuellement pas de renseignements personnels
            contre de l'argent et ne partage pas intentionnellement des
            renseignements personnels à des fins de publicité comportementale
            intercontextuelle. Si nos pratiques changent, nous mettrons à jour
            nos avis et fournirons les contrôles de retrait requis.
          </p>
        </section>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
          Consultez aussi notre{" "}
          <Link
            href="/privacy"
            className="font-semibold text-cyan-200 underline"
          >
            Politique de confidentialité
          </Link>{" "}
          et{" "}
          <Link href="/terms" className="font-semibold text-cyan-200 underline">
            Conditions d'utilisation
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
