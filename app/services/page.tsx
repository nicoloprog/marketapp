import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  Droplets,
  Disc,
  Cpu,
  RotateCcw,
  Settings2,
  Thermometer,
  Clock,
  DollarSign,
} from "lucide-react";
import { getServices, formatPrice } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Professional auto repair services - oil changes, brake service, engine diagnostics, and more.",
};

const iconMap: Record<string, React.ElementType> = {
  "Oil Change": Droplets,
  "Brake Service": Disc,
  "Engine Diagnostics": Cpu,
  "Tire Rotation & Balance": RotateCcw,
  "Transmission Service": Settings2,
  "AC Service & Repair": Thermometer,
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-background py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 max-w-2xl">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-foreground">
                Our Services
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                From routine oil changes to complex engine work, our certified
                technicians deliver quality repairs you can trust.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {services.map((service) => {
                const Icon = iconMap[service.name] || Settings2;
                return (
                  <div
                    key={service.id}
                    className="flex gap-5 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
                        {service.name}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1 text-sm text-primary">
                          <DollarSign className="h-4 w-4" />
                          From {formatPrice(service.base_price)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />~
                          {service.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
                Need a custom quote?
              </h3>
              <p className="mt-2 text-muted-foreground">
                Book a diagnostic appointment and our team will provide a
                detailed estimate.
              </p>
              <Link href="/booking" className="mt-6 inline-block">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Book an Appointment
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
