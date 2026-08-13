import Link from "next/link";
import { FileText } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const sections = [
  {
    title: "1. Acceptation des conditions",
    body: [
      "Les présentes Conditions d'utilisation régissent votre accès à BanditPrice et votre utilisation de BanditPrice. En créant un compte, en vous abonnant, en effectuant une recherche ou en utilisant le service, vous acceptez ces Conditions.",
      "Si vous n'acceptez pas ces Conditions, n'utilisez pas BanditPrice.",
    ],
  },
  {
    title: "2. Le service",
    body: [
      "BanditPrice fournit la recherche de produits, la recherche de pièces de véhicule, la recherche de matériaux de construction, la découverte de résultats d'achat localisés, la gestion des abonnements et les fonctionnalités de compte connexes.",
      "Les résultats de recherche peuvent provenir de détaillants tiers, de places de marché, de fournisseurs de recherche, de sources publiques de données sur les véhicules ou d'autres services externes. La disponibilité, les prix, la livraison, les taxes, les stocks et les détails des produits peuvent changer et doivent être confirmés auprès du détaillant avant l'achat.",
    ],
  },
  {
    title: "3. Comptes et sécurité",
    body: [
      "Vous devez fournir des renseignements de compte exacts et garder vos identifiants de connexion confidentiels.",
      "Vous êtes responsable de l'activité effectuée avec votre compte. Avisez-nous rapidement si vous soupçonnez un accès non autorisé.",
      "Nous pouvons suspendre ou restreindre les comptes qui enfreignent ces Conditions, abusent du service, contournent les limites, nuisent à la sécurité ou créent un risque juridique ou opérationnel.",
    ],
  },
  {
    title: "4. Abonnements, facturation et annulation",
    body: [
      "Les plans payants offrent des limites de recherche mensuelles et d'autres fonctionnalités d'abonnement décrites sur la page d'abonnement ou dans votre compte.",
      "Les paiements, les méthodes de paiement, les factures, les changements d'abonnement et les annulations sont traités par Stripe. Le Checkout hébergé et le portail de facturation de Stripe peuvent appliquer leurs propres conditions et pratiques de confidentialité.",
      "Sauf si un essai gratuit ou une promotion s'applique, les frais d'abonnement sont facturés selon le plan récurrent sélectionné. Vous pouvez annuler ou gérer votre abonnement par l'entremise du portail de facturation Stripe lorsqu'il est disponible.",
      "Les changements apportés à un abonnement peuvent entraîner des proratas, une modification du prix de renouvellement ou d'autres ajustements de facturation affichés par Stripe.",
    ],
  },
  {
    title: "5. Limites de recherche et utilisation équitable",
    body: [
      "Les limites de recherche mensuelles sont liées à votre plan d'abonnement. Les plans Débutant, Standard, Entreprise et Sur mesure peuvent avoir des limites différentes.",
      "Les décomptes de recherche peuvent inclure les recherches de véhicules, les recherches de produits, les recherches de matériaux et d'autres requêtes de résultats de produits. Les administrateurs peuvent être exemptés du blocage, mais l'utilisation peut tout de même être comptabilisée à des fins de visibilité et d'audit.",
      "Vous ne pouvez pas automatiser, extraire, revendre, surcharger ou contourner les limites de recherche, les limites de débit, l'authentification, les contrôles de localisation ou les contrôles d'abonnement.",
    ],
  },
  {
    title: "6. Données et conformité",
    body: [
      "Vous acceptez que nous puissions traiter les renseignements de compte, d'abonnement, de recherche, d'utilisation, de préférence de localisation et les renseignements techniques comme décrit dans notre Politique de confidentialité.",
      "Si vous soumettez des NIV, des détails de véhicule, des termes de produits ou des choix de localisation, vous déclarez avoir le droit de soumettre ces renseignements et qu'ils ne sont pas illégaux, nuisibles ou contrefaisants.",
      "Vous ne pouvez pas utiliser BanditPrice pour traiter des données réglementées que le service n'est pas conçu pour gérer, y compris des données sensibles sur la santé, des comptes financiers, des pièces d'identité gouvernementales ou des enfants.",
      "Vous êtes responsable du respect des lois qui s'appliquent à votre utilisation des résultats de recherche, aux achats, aux activités de revente, aux taxes, à la protection des consommateurs, à l'importation/exportation et aux décisions de réparation de véhicules.",
    ],
  },
  {
    title: "7. Services tiers et détaillants",
    body: [
      "BanditPrice peut créer des liens vers Amazon, des résultats Google Shopping, des détaillants, Stripe, Supabase, des sources publiques de données sur les véhicules et d'autres services tiers.",
      "Nous ne contrôlons pas les sites tiers, les prix, l'inventaire, la livraison, les retours, les garanties, les taxes, les descriptions de produits ou les pratiques des marchands. Vos transactions avec des tiers se font entre vous et ce tiers.",
    ],
  },
  {
    title: "8. Renseignements sur les produits et les véhicules",
    body: [
      "BanditPrice est un outil informatif de recherche et de comparaison. Il ne garantit pas qu'une pièce, un produit ou un matériau est compatible, sécuritaire, disponible ou au prix le plus bas.",
      "Pour les pièces de véhicule, vérifiez la compatibilité auprès du fabricant, du détaillant, du mécanicien ou d'un professionnel qualifié avant l'achat ou l'installation.",
    ],
  },
  {
    title: "9. Propriété intellectuelle et conduite interdite",
    body: [
      "BanditPrice, son logiciel, son design, son image de marque et son contenu nous appartiennent ou appartiennent à nos concédants. Vous ne pouvez pas copier, modifier, distribuer, faire de l'ingénierie inverse ou créer des œuvres dérivées, sauf si la loi ou une autorisation écrite le permet.",
      "Vous ne pouvez pas utiliser BanditPrice pour des activités illégales, des tests de sécurité sans autorisation, l'extraction automatisée, le partage d'identifiants, la fraude à l'abonnement, la fraude au paiement, la contrefaçon, le harcèlement, les logiciels malveillants ou des tentatives de perturber le service.",
    ],
  },
  {
    title: "10. Exclusions de garantie et limitation de responsabilité",
    body: [
      "BanditPrice est fourni tel quel et selon la disponibilité. Nous ne promettons pas un service ininterrompu, des résultats sans erreur, des économies garanties, la disponibilité des produits ou l'exactitude des marchands.",
      "Dans toute la mesure permise par la loi, nous excluons les garanties de qualité marchande, d'adaptation à un usage particulier, d'absence de contrefaçon et d'exactitude.",
      "Dans toute la mesure permise par la loi, BanditPrice ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs, exemplaires ou punitifs, ni des pertes de profits, pertes de données, décisions d'achat, résultats de réparation ou problèmes liés à des marchands tiers.",
    ],
  },
  {
    title: "11. Résiliation et modifications",
    body: [
      "Vous pouvez cesser d'utiliser le service en tout temps. Nous pouvons suspendre ou résilier l'accès si vous enfreignez ces Conditions, créez un risque, omettez de payer ou utilisez le service de manière abusive.",
      "Nous pouvons mettre à jour ces Conditions lorsque le service évolue. Votre utilisation continue après les changements signifie que vous acceptez les Conditions mises à jour.",
    ],
  },
  {
    title: "12. Contact",
    body: ["Questions au sujet de ces Conditions : contact@banditprice.com."],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-lg border border-white/10 bg-slate-950/75 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                BanditPrice
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Conditions d'utilisation
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Date d'entrée en vigueur : 15 juillet 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Ces Conditions d'utilisation régissent votre accès au service
            BanditPrice et votre utilisation du service.
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <h2 className="text-lg font-semibold text-white">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
          Consultez aussi notre{" "}
          <Link
            href="/privacy"
            className="font-semibold text-cyan-200 underline"
          >
            Politique de confidentialité
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
