import Link from "next/link";
import { Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center sm:p-12">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground">
            Prêt à faire entretenir votre véhicule ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Réservez en ligne en quelques minutes ou appelez-nous. Nous
            proposons des rendez-vous le jour même et une tarification
            transparente pour tous nos services.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/booking">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Calendar className="h-4 w-4" />
                Réserver en ligne
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border text-foreground"
            >
              <Phone className="h-4 w-4" />
              (450) 555-0199
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
