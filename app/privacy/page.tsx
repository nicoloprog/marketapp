import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const sections = [
  {
    title: "1. Aperçu",
    body: [
      "La présente Politique de confidentialité explique comment BanditPrice collecte, utilise, partage et protège les renseignements lorsque vous utilisez notre site Web, les fonctionnalités de compte, les outils de recherche, les abonnements, les préférences de localisation et les services connexes.",
      "Nous visons à décrire nos pratiques de données de façon claire et exacte. Nous ne vendons pas les données de cartes de paiement et nous ne stockons pas les numéros complets de cartes de paiement sur nos serveurs.",
    ],
  },
  {
    title: "2. Renseignements que nous collectons",
    body: [
      "Renseignements de compte : nom, adresse courriel, identifiant utilisateur, rôle, plan d'abonnement, statut de l'abonnement et paramètres du compte.",
      "Renseignements de recherche : termes de recherche de produits, marque/modèle/année du véhicule, NIV ou détails de véhicule que vous soumettez, recherches de matériaux de construction, source de recherche et décomptes mensuels d'utilisation des recherches.",
      "Renseignements de localisation : pays, province/État, ville ou localisation approximative du navigateur uniquement lorsque vous autorisez l'accès à la localisation ou sélectionnez manuellement une localisation.",
      "Renseignements de paiement et de facturation : identifiant client Stripe, identifiant d'abonnement, statut de l'abonnement, métadonnées du plan, factures et activité du portail de facturation. Stripe traite directement les détails des cartes de paiement.",
      "Renseignements techniques : cookies, renseignements sur l'appareil/le navigateur, signaux de sécurité dérivés de l'adresse IP, journaux de requêtes, événements de limite de débit et pages ou fonctionnalités utilisées.",
    ],
  },
  {
    title: "3. Comment nous utilisons les renseignements",
    body: [
      "Pour fournir la recherche de produits, la recherche de pièces de véhicule, la recherche de matériaux de construction et les résultats d'achat localisés.",
      "Pour gérer les comptes, l'authentification, les abonnements, les limites de recherche mensuelles, le soutien client, la facturation et les contrôles administratifs.",
      "Pour protéger le service contre la fraude, les abus, les accès non autorisés, l'utilisation abusive de l'extraction automatisée et les incidents de sécurité.",
      "Pour améliorer la fiabilité, la qualité des recherches, l'expérience utilisateur et la performance du produit.",
      "Pour respecter les obligations juridiques, fiscales, comptables, de rétrofacturation et de traitement des paiements.",
    ],
  },
  {
    title: "4. Cookies, consentement et localisation",
    body: [
      "Nous utilisons des cookies et le stockage local du navigateur pour les sessions de connexion, le consentement aux cookies, le pays/la région/la ville sélectionnés et les préférences de base de l'application.",
      "Si vous refusez le consentement optionnel à la localisation, nous n'utilisons pas la géolocalisation du navigateur pour les résultats de produits régionaux. Vous pouvez tout de même sélectionner une localisation manuellement lorsque cette option est disponible.",
      "Vous pouvez supprimer les cookies ou révoquer l'autorisation de localisation du navigateur dans les paramètres de votre navigateur. Cela peut réinitialiser les préférences ou vous obliger à vous reconnecter.",
    ],
  },
  {
    title: "5. Partage et fournisseurs de services",
    body: [
      "Nous partageons des renseignements avec des fournisseurs de services uniquement lorsque cela est nécessaire pour exploiter l'application. Ceux-ci peuvent inclure Supabase pour les services d'authentification/de base de données, Stripe pour les paiements et la facturation, les fournisseurs de recherche utilisés pour récupérer les résultats de produits, les fournisseurs d'hébergement/d'infrastructure et les outils de sécurité ou d'analyse.",
      "Lorsque vous cliquez sur un résultat de détaillant, vous quittez BanditPrice et les propres pratiques de confidentialité du détaillant s'appliquent.",
      "Nous pouvons divulguer des renseignements si la loi, une procédure judiciaire, la prévention de la fraude, les enquêtes de sécurité ou la protection des droits, des utilisateurs et du service l'exigent.",
    ],
  },
  {
    title: "6. Données de paiement",
    body: [
      "Le paiement, la collecte des cartes, les factures, les changements d'abonnement et les annulations sont gérés par Stripe. BanditPrice reçoit des métadonnées de facturation limitées, comme l'identifiant client, l'identifiant d'abonnement, le plan et le statut de l'abonnement.",
      "N'entrez pas de données de carte de paiement ailleurs que sur les pages de Checkout Stripe hébergées ou du portail de facturation Stripe.",
    ],
  },
  {
    title: "7. Vos choix et votre accès",
    body: [
      "Vous pouvez accéder à votre page de compte pour consulter le statut du compte, le statut de l'abonnement et l'utilisation mensuelle des recherches.",
      "Vous pouvez gérer la facturation de l'abonnement, l'annulation, les méthodes de paiement et les factures par l'entremise du portail de facturation Stripe lorsqu'il est disponible.",
      "Vous pouvez nous contacter pour demander l'accès, la correction, la suppression ou l'exportation de renseignements personnels, sous réserve de la vérification de votre identité et des exigences de conservation légale.",
    ],
  },
  {
    title: "8. Conservation des données et sécurité",
    body: [
      "Nous conservons les dossiers de compte et d'abonnement tant que votre compte est actif et selon les besoins liés à la facturation, à la sécurité, aux obligations juridiques, fiscales et comptables ainsi qu'aux différends.",
      "L'utilisation mensuelle des recherches est conservée pour appliquer les limites d'abonnement, auditer les abus et fournir une visibilité au compte et aux administrateurs. Nous pouvons agréger ou anonymiser les données pour améliorer le service.",
      "Nous utilisons des mesures de protection administratives, techniques et organisationnelles raisonnables conçues pour protéger les renseignements personnels, y compris les contrôles d'authentification, l'application côté serveur des abonnements, les limites de débit et l'accès limité aux outils administratifs.",
    ],
  },
  {
    title: "9. RGPD, RGPD du Royaume-Uni et droits EEE/Royaume-Uni",
    body: [
      "Si vous êtes dans l'Espace économique européen, au Royaume-Uni ou dans une autre région dotée de lois similaires sur la protection des données, vous pouvez avoir le droit d'accéder à vos données personnelles, de les corriger, de les supprimer, d'en restreindre le traitement, de vous y opposer ou d'en recevoir une copie portable.",
      "Lorsque le traitement repose sur le consentement, vous pouvez retirer votre consentement en tout temps. Le retrait du consentement n'affecte pas le traitement effectué avant ce retrait.",
      "Nous traitons les données personnelles pour fournir le service, exécuter notre contrat avec vous, respecter nos obligations légales, protéger des intérêts légitimes comme la sécurité et la prévention de la fraude et, lorsque requis, sur la base du consentement.",
      "Vous pouvez également avoir le droit de déposer une plainte auprès de votre autorité locale de protection des données.",
    ],
  },
  {
    title: "10. Avis de confidentialité de la Californie",
    body: [
      "Si vous résidez en Californie, vous pouvez avoir le droit de connaître/d'accéder, de supprimer, de corriger, de vous opposer à la vente ou au partage, de limiter l'utilisation de renseignements personnels sensibles et de ne pas subir de discrimination pour l'exercice de vos droits à la confidentialité.",
      "BanditPrice ne vend pas de renseignements personnels contre de l'argent. Nous ne partageons pas non plus intentionnellement des renseignements personnels à des fins de publicité comportementale intercontextuelle. Si cela change, nous mettrons à jour cette politique et fournirons les contrôles de retrait requis.",
      "Les catégories de renseignements personnels que nous pouvons collecter comprennent les identifiants, les renseignements de compte, les métadonnées d'abonnement et de transaction, l'activité Internet ou réseau, la localisation approximative ou sélectionnée manuellement, les renseignements de recherche fournis par l'utilisateur et les inférences nécessaires pour fournir les fonctionnalités de recherche et de compte.",
      "Nous utilisons ces renseignements aux fins commerciales décrites dans cette politique, notamment pour fournir l'application, les abonnements, la facturation, la sécurité, la prévention de la fraude, le soutien, la conformité, l'analyse et l'amélioration du service.",
    ],
  },
  {
    title: "11. Renseignements personnels sensibles",
    body: [
      "BanditPrice n'est pas conçu pour collecter des renseignements sensibles liés à la santé, aux comptes financiers, aux pièces d'identité gouvernementales, aux données biométriques, raciales, religieuses, syndicales, à l'orientation sexuelle ou aux enfants.",
      "La géolocalisation précise du navigateur est demandée uniquement si vous choisissez d'utiliser votre position actuelle. Vous pouvez refuser ou révoquer l'autorisation de localisation du navigateur. Nous utilisons la localisation pour localiser les résultats de produits, et non pour déduire des caractéristiques sensibles.",
    ],
  },
  {
    title: "12. Enfants et droits régionaux",
    body: [
      "BanditPrice ne s'adresse pas aux enfants de moins de 13 ans et nous ne collectons pas sciemment de renseignements personnels auprès d'enfants de moins de 13 ans.",
      "Si les lois locales prévoient des droits supplémentaires en matière de confidentialité, nous traiterons les demandes vérifiées conformément à la loi applicable.",
    ],
  },
  {
    title: "13. Contact et mises à jour",
    body: [
      "Nous pouvons mettre à jour la présente Politique de confidentialité lorsque notre service, nos fournisseurs, nos obligations légales ou nos pratiques de données changent.",
      "Pour toute question ou demande relative à la confidentialité, contactez : contact@banditprice.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-lg border border-white/10 bg-slate-950/75 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                BanditPrice
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Politique de confidentialité
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Date d'entrée en vigueur : 15 juillet 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Cette politique est rédigée afin de fournir un avis clair sur nos
            pratiques de données et de soutenir les attentes de confidentialité
            des utilisateurs.
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
          Consultez aussi nos{" "}
          <Link href="/terms" className="font-semibold text-cyan-200 underline">
            Conditions d'utilisation
          </Link>{" "}
          et{" "}
          <Link
            href="/privacy/choices"
            className="font-semibold text-cyan-200 underline"
          >
            Choix de confidentialité
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
