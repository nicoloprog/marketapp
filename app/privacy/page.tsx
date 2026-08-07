import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const sections = [
  {
    title: "1. Overview",
    body: [
      "This Privacy Policy explains how BanditPrice collects, uses, shares, and protects information when you use our website, account features, search tools, subscriptions, location preferences, and related services.",
      "We aim to describe our data practices clearly and accurately. We do not sell payment card data, and we do not store full payment card numbers on our servers.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "Account information: name, email address, user ID, role, subscription plan, subscription status, and account settings.",
      "Search information: product search terms, vehicle make/model/year, VIN or vehicle details you submit, construction material searches, search source, and monthly search usage counts.",
      "Location information: country, province/state, city, or approximate browser location only when you allow location access or manually select a location.",
      "Payment and billing information: Stripe customer ID, subscription ID, subscription status, plan metadata, invoices, and billing portal activity. Stripe processes payment card details directly.",
      "Technical information: cookies, device/browser information, IP-derived security signals, request logs, rate-limit events, and pages or features used.",
    ],
  },
  {
    title: "3. How We Use Information",
    body: [
      "To provide product search, vehicle part search, construction material search, and localized shopping results.",
      "To manage accounts, authentication, subscriptions, monthly search limits, customer support, billing, and administrative controls.",
      "To protect the service from fraud, abuse, unauthorized access, scraping misuse, and security incidents.",
      "To improve reliability, search quality, user experience, and product performance.",
      "To comply with legal, tax, accounting, chargeback, and payment-processing obligations.",
    ],
  },
  {
    title: "4. Cookies, Consent, and Location",
    body: [
      "We use cookies and local browser storage for sign-in sessions, cookie consent, selected country/region/city, and basic app preferences.",
      "If you decline optional location consent, we do not use browser geolocation for regional product results. You may still select a location manually where available.",
      "You can clear cookies or revoke browser location permission in your browser settings. Doing so may reset preferences or require you to sign in again.",
    ],
  },
  {
    title: "5. Sharing and Service Providers",
    body: [
      "We share information with service providers only as needed to operate the app. These may include Supabase for authentication/database services, Stripe for payments and billing, search providers used to retrieve product results, hosting/infrastructure providers, and security or analytics tools.",
      "When you click a retailer result, you leave BanditPrice and the retailer's own privacy practices apply.",
      "We may disclose information if required by law, legal process, fraud prevention, security investigations, or to protect rights, users, and the service.",
    ],
  },
  {
    title: "6. Payment Data",
    body: [
      "Payment checkout, card collection, invoices, subscription changes, and cancellations are handled by Stripe. BanditPrice receives limited billing metadata such as customer ID, subscription ID, plan, and subscription status.",
      "Do not enter payment card data anywhere except the hosted Stripe checkout or Stripe billing portal pages.",
    ],
  },
  {
    title: "7. Your Choices and Access",
    body: [
      "You can access your account page to review account status, subscription status, and monthly search usage.",
      "You can manage subscription billing, cancellation, payment methods, and invoices through the Stripe Billing Portal when available.",
      "You may contact us to request access, correction, deletion, or export of personal information, subject to identity verification and legal retention requirements.",
    ],
  },
  {
    title: "8. Data Retention and Security",
    body: [
      "We keep account and subscription records while your account is active and as needed for billing, security, legal, tax, accounting, and dispute purposes.",
      "Monthly search usage is kept to enforce subscription limits, audit abuse, and provide account/admin visibility. We may aggregate or de-identify data for service improvement.",
      "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information, including authentication controls, server-side subscription enforcement, rate limits, and limited access to administrative tools.",
    ],
  },
  {
    title: "9. GDPR, UK GDPR, and EEA/UK Rights",
    body: [
      "If you are in the European Economic Area, United Kingdom, or another region with similar data protection laws, you may have rights to access, correct, delete, restrict, object to, or receive a portable copy of your personal data.",
      "Where processing is based on consent, you may withdraw consent at any time. Withdrawing consent does not affect processing that happened before withdrawal.",
      "We process personal data to provide the service, perform our contract with you, comply with legal obligations, protect legitimate interests such as security and fraud prevention, and, where required, based on consent.",
      "You may also have the right to complain to your local data protection authority.",
    ],
  },
  {
    title: "10. California Privacy Notice",
    body: [
      "If you are a California resident, you may have rights to know/access, delete, correct, opt out of sale or sharing, limit use of sensitive personal information, and not be discriminated against for exercising privacy rights.",
      "BanditPrice does not sell personal information for money. We also do not intentionally share personal information for cross-context behavioral advertising. If that changes, we will update this policy and provide required opt-out controls.",
      "The categories of personal information we may collect include identifiers, account information, subscription and transaction metadata, internet or network activity, approximate location or manually selected location, user-provided search information, and inferences needed to provide search and account features.",
      "We use this information for the business purposes described in this policy, including providing the app, subscriptions, billing, security, fraud prevention, support, compliance, analytics, and service improvement.",
    ],
  },
  {
    title: "11. Sensitive Personal Information",
    body: [
      "BanditPrice is not designed to collect sensitive health, financial account, government ID, biometric, racial, religious, union, sexual orientation, or children's information.",
      "Precise browser geolocation is only requested if you choose to use current location. You can deny or revoke browser location permission. We use location to localize product results, not to infer sensitive characteristics.",
    ],
  },
  {
    title: "12. Children and Regional Rights",
    body: [
      "BanditPrice is not directed to children under 13, and we do not knowingly collect personal information from children under 13.",
      "If local laws provide additional privacy rights, we will handle verified requests according to applicable law.",
    ],
  },
  {
    title: "13. Contact and Updates",
    body: [
      "We may update this Privacy Policy when our service, providers, legal obligations, or data practices change.",
      "For privacy questions or requests, contact: contact@banditprice.com.",
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
                Privacy Policy
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Effective date: July 15, 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            This policy is written to provide clear notice of our data practices
            and to support privacy-by-design expectations. It should be reviewed
            by qualified counsel before production launch.
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
          See also our{" "}
          <Link href="/terms" className="font-semibold text-cyan-200 underline">
            Terms of Use
          </Link>
          {" "}and{" "}
          <Link
            href="/privacy/choices"
            className="font-semibold text-cyan-200 underline"
          >
            Privacy Choices
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
