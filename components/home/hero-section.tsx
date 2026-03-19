import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-gradient-to-r from-slate-600 to-slate-800">
      <div className="absolute inset-0 " />
      <div className="relative mx-auto max-w-7xl px-4 py-24 lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {/* <span className="h-1.5 w-1.5 rounded-full bg-primary" /> */}
            Découvrez les prix les plus bas sur le marché
          </div>
          <h1 className="text-balance font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Un magasinage{" "}
            <span className="text-primary">simple et efficace</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Remplacez vos habitudes de magasinage fastidieuses par une
            expérience fluide et agréable. En obtenant les meilleures offres.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* <Link href="/booking">
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Calendar className="h-4 w-4" />
                Prendre un rendez-vous
              </Button>
            </Link> */}
            <Link href="/articles">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border text-foreground hover:bg-secondary"
              >
                Articles en magasin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border text-foreground hover:bg-secondary"
              >
                Pièces de véhicules
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/construction">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border text-foreground hover:bg-secondary"
              >
                Matériaux de construction
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
