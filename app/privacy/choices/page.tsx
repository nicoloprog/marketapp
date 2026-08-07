import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-layout";

const rights = [
  "Access or know what personal information we process about you.",
  "Request correction of inaccurate personal information.",
  "Request deletion of personal information, subject to legal, security, billing, fraud-prevention, and operational retention needs.",
  "Request a portable copy of information where required by law.",
  "Object to or restrict certain processing where applicable.",
  "Withdraw consent for optional location processing by changing browser permission or app location preferences.",
  "Opt out of sale or sharing of personal information. BanditPrice does not currently sell personal information or intentionally share it for cross-context behavioral advertising.",
  "Limit use of sensitive personal information where applicable. BanditPrice does not use sensitive personal information to infer characteristics.",
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
                Privacy Choices
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Effective date: July 15, 2026
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Use this page to understand and exercise privacy choices available
            under laws such as GDPR, UK GDPR, CCPA/CPRA, and similar regional
            privacy laws.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Your Rights</h2>
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
          <h2 className="text-lg font-semibold">Submit a Request</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Email us at{" "}
            <a
              href="mailto:contact@banditprice.com?subject=Privacy%20Request"
              className="font-semibold text-cyan-200 underline"
            >
              contact@banditprice.com
            </a>{" "}
            with the subject “Privacy Request”. Include the email address used
            for your BanditPrice account and the right you want to exercise. We
            may need to verify your identity before completing the request.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            California authorized agents may submit requests using the same
            email address. We may require proof of authorization and identity
            verification consistent with applicable law.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Cookies and Location</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            You can clear BanditPrice cookies in your browser to reset consent
            and location preferences. You can revoke browser geolocation access
            through your browser or operating system location settings. If you
            revoke location access, you may still select a location manually
            where the app provides that option.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold">Sale or Sharing</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            BanditPrice does not currently sell personal information for money
            and does not intentionally share personal information for
            cross-context behavioral advertising. If our practices change, we
            will update our notices and provide required opt-out controls.
          </p>
        </section>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
          See also our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-cyan-200 underline"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-semibold text-cyan-200 underline">
            Terms of Use
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
