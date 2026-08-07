import Link from "next/link";
import { FileText } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "These Terms of Use govern your access to and use of BanditPrice. By creating an account, subscribing, searching, or using the service, you agree to these Terms.",
      "If you do not agree, do not use BanditPrice.",
    ],
  },
  {
    title: "2. The Service",
    body: [
      "BanditPrice provides product search, vehicle part search, construction material search, localized shopping result discovery, subscription management, and related account features.",
      "Search results may come from third-party retailers, marketplaces, search providers, public vehicle data sources, or other external services. Availability, pricing, shipping, taxes, stock, and product details may change and must be confirmed with the retailer before purchase.",
    ],
  },
  {
    title: "3. Accounts and Security",
    body: [
      "You must provide accurate account information and keep your login credentials confidential.",
      "You are responsible for activity under your account. Notify us promptly if you suspect unauthorized access.",
      "We may suspend or restrict accounts that violate these Terms, abuse the service, bypass limits, interfere with security, or create legal or operational risk.",
    ],
  },
  {
    title: "4. Subscriptions, Billing, and Cancellation",
    body: [
      "Paid plans provide monthly search limits and other subscription features described on the subscription page or in your account.",
      "Payments, payment methods, invoices, subscription changes, and cancellations are processed by Stripe. Stripe's hosted Checkout and Billing Portal may apply their own terms and privacy practices.",
      "Unless a free trial or promotion applies, subscription fees are billed according to the selected recurring plan. You may cancel or manage your subscription through the Stripe Billing Portal when available.",
      "Changes to a subscription may result in prorations, changed renewal pricing, or other billing adjustments shown by Stripe.",
    ],
  },
  {
    title: "5. Search Limits and Fair Use",
    body: [
      "Monthly search limits are tied to your subscription plan. Beginner, Standard, Business, and Custom plans may have different limits.",
      "Search counts may include vehicle searches, product searches, material searches, and other product-result queries. Admin users may be exempt from blocking but usage may still be counted for audit visibility.",
      "You may not automate, scrape, resell, overload, or bypass search limits, rate limits, authentication, location controls, or subscription controls.",
    ],
  },
  {
    title: "6. Data and Compliance",
    body: [
      "You agree that we may process account, subscription, search, usage, location preference, and technical information as described in our Privacy Policy.",
      "If you submit VINs, vehicle details, product terms, or location selections, you represent that you have the right to submit that information and that it is not unlawful, harmful, or infringing.",
      "You may not use BanditPrice to process regulated data that the service is not designed to handle, including sensitive health, financial account, government ID, or children's data.",
      "You are responsible for complying with laws that apply to your use of search results, purchases, resale activity, taxes, consumer protection, import/export, and vehicle repair decisions.",
    ],
  },
  {
    title: "7. Third-Party Services and Retailers",
    body: [
      "BanditPrice may link to Amazon, Google Shopping results, retailers, Stripe, Supabase, public vehicle data sources, and other third-party services.",
      "We do not control third-party sites, prices, inventory, shipping, returns, warranties, taxes, product descriptions, or merchant practices. Your transactions with third parties are between you and that third party.",
    ],
  },
  {
    title: "8. Product and Vehicle Information",
    body: [
      "BanditPrice is an informational search and comparison tool. It does not guarantee that a part, product, or material is compatible, safe, available, or the lowest price.",
      "For vehicle parts, verify fitment with the manufacturer, retailer, mechanic, or qualified professional before purchase or installation.",
    ],
  },
  {
    title: "9. Intellectual Property and Prohibited Conduct",
    body: [
      "BanditPrice, its software, design, branding, and content are owned by us or our licensors. You may not copy, modify, distribute, reverse engineer, or create derivative works except as allowed by law or written permission.",
      "You may not use BanditPrice for unlawful activity, security testing without permission, automated scraping, credential sharing, subscription fraud, payment fraud, infringement, harassment, malware, or attempts to disrupt the service.",
    ],
  },
  {
    title: "10. Disclaimers and Limitation of Liability",
    body: [
      "BanditPrice is provided on an as-is and as-available basis. We do not promise uninterrupted service, error-free results, guaranteed savings, product availability, or merchant accuracy.",
      "To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy.",
      "To the fullest extent permitted by law, BanditPrice will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, purchase decisions, repair outcomes, or third-party merchant issues.",
    ],
  },
  {
    title: "11. Termination and Changes",
    body: [
      "You may stop using the service at any time. We may suspend or terminate access if you violate these Terms, create risk, fail to pay, or misuse the service.",
      "We may update these Terms as the service changes. Continued use after changes means you accept the updated Terms.",
    ],
  },
  {
    title: "12. Contact",
    body: ["Questions about these Terms: contact@banditprice.com."],
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
                Terms of Use
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Effective date: July 15, 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            These Terms are a practical baseline for the current app and should
            be reviewed by qualified counsel before production launch.
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
          <Link
            href="/privacy"
            className="font-semibold text-cyan-200 underline"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
