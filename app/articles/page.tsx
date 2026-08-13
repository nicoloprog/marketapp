"use client";

import { useState, useCallback } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  Search,
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/data";
import { parsePrice } from "@/lib/price";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type RetailerSource = "amazon" | "shopping";

interface AutoCarePart {
  partTerminologyName: string;
  brandLabel: string;
  partNumber: string;
  description: string;
  price?: number;
  link?: string;
  thumbnail?: string;
  source: RetailerSource;
}

// ── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: RetailerSource }) {
  if (source === "amazon") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
        Amazon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px]">
      {/* brandLabel is the actual store name from Google Shopping */}
    </span>
  );
}

// ── Placeholder image ─────────────────────────────────────────────────────────
function ImagePlaceholder() {
  return (
    <div className="w-full h-40 bg-muted flex items-center justify-center">
      <svg
        className="h-8 w-8 text-muted-foreground/30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

// ── Part card ─────────────────────────────────────────────────────────────────
function PartCard({
  part,
  isCheapest,
}: {
  part: AutoCarePart;
  isCheapest: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={part.link ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[300px] flex-col overflow-visible rounded-2xl border border-transparent bg-transparent transition-all duration-300 ${
        part.link
          ? "cursor-pointer hover:-translate-y-1"
          : "cursor-default"
      } ${
        isCheapest
          ? "ring-0"
          : ""
      }`}
    >
      {isCheapest && (
        <div className="absolute left-1/2 top-[132px] z-10 -translate-x-1/2 rounded-full bg-green-400 px-3 py-1 text-[10px] font-bold text-slate-950 shadow-[0_8px_24px_rgba(74,222,128,0.35)]">
          Meilleur prix
        </div>
      )}

      {part.thumbnail && !imgError ? (
        <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-t-2xl border border-blue-400/15 bg-gradient-to-b from-slate-50 to-slate-200">
          <img
            src={part.thumbnail}
            alt={part.partTerminologyName}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <ImagePlaceholder />
      )}

      <div className="relative -mt-2 mx-3 mb-3 flex flex-1 flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4 shadow-[0_12px_30px_rgba(2,6,23,0.28)] backdrop-blur transition-shadow group-hover:shadow-[0_18px_42px_rgba(14,165,233,0.16)]">
        {/* Source + store row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {part.source === "shopping" && (
              <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                {part.brandLabel}
              </span>
            )}
            <SourceBadge source={part.source} />
          </div>
        </div>

        <h3 className="line-clamp-2 min-h-[40px] flex-1 text-sm font-semibold leading-snug text-white">
          {part.partTerminologyName}
        </h3>

        <div className="mt-auto flex items-center justify-center pt-1">
          {part.price != null ? (
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${
                isCheapest
                  ? "border-green-300/60 bg-green-400/12 text-green-300"
                  : "border-blue-300/45 bg-blue-400/10 text-blue-200"
              }`}
            >
              <span
                className={isCheapest ? "text-green-300" : "text-blue-200"}
              >
                {formatPrice(part.price)}
              </span>
              <span className="text-[10px] font-bold text-slate-300">
                CA$
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Voir le site
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

// ── Results grid ──────────────────────────────────────────────────────────────
const PREVIEW = 3;

function ResultsGrid({ parts }: { parts: AutoCarePart[] }) {
  const [expanded, setExpanded] = useState(false);
  if (parts.length === 0) return null;

  const cheapestPrice = parts.find((p) => p.price != null)?.price;
  const visible = expanded ? parts : parts.slice(0, PREVIEW);
  const hiddenCount = parts.length - PREVIEW;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-[77%] text-sm text-blue-100">
        {/* {cheapestPrice != null && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            · Meilleur prix : {formatPrice(cheapestPrice)} CA$
          </span>
        )} */}

        <span>
          {parts.length} Article{parts.length !== 1 ? "s" : ""} trouvé
          {parts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((part, i) => (
          <PartCard
            key={i}
            part={part}
            isCheapest={part.price != null && part.price === cheapestPrice}
          />
        ))}
      </div>
      {parts.length > PREVIEW && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="flex items-center gap-1.5 text-md bg-blue-400 text-gray-800 px-2 py-1 rounded"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-6 w-6" /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-6 w-6 " /> {hiddenCount} article
              {hiddenCount !== 1 ? "s" : ""} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [allParts, setAllParts] = useState<AutoCarePart[]>([]);
  const [acLoading, setAcLoading] = useState(false);
  const [partSearch, setPartSearch] = useState("");

  const lookupParts = useCallback(async (term: string) => {
    if (!term.trim()) {
      toast.error("Veuillez entrer un nom de produit");
      return;
    }

    setAcLoading(true);
    setAllParts([]);

    try {
      const res = await fetch(
        `/api/searcharticles?${new URLSearchParams({ q: term.trim() })}`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Server returned ${res.status}`);
      }

      const mapPart = (item: any, source: RetailerSource): AutoCarePart => ({
        partTerminologyName: item.partTerminologyName ?? "Sans titre",
        brandLabel: item.brandLabel ?? "Inconnu",
        partNumber: item.partNumber ?? "S/O",
        description: item.description ?? "",
        price:
          typeof item.price === "string"
            ? (parsePrice(item.price) ?? undefined)
            : typeof item.price === "number"
              ? item.price
              : undefined,
        link: item.link ?? undefined,
        thumbnail: item.thumbnail ?? undefined,
        source,
      });

      // Merge both sources and sort by cheapest first, items without price go last
      const merged = [
        ...(data.amazon || []).map((i: any) => mapPart(i, "amazon")),
        ...(data.shopping || []).map((i: any) => mapPart(i, "shopping")),
      ].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

      setAllParts(merged);
      if (merged.length === 0)
        toast.info("Aucun résultat trouvé pour cette recherche.");
    } catch (err: any) {
      console.error("Lookup error:", err);
      toast.error(err?.message || "Échec de la recherche. Vérifiez la console.");
    } finally {
      setAcLoading(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-r from-slate-600 to-slate-800 py-16">
        <div className="mx-auto max-w-7xl px-4 space-y-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">
              Trouvez vos produits au meilleur prix
            </h1>
            <p className="mt-2 text-muted-foreground">
              Épicerie, Électronique, électroménager, Cadeaux, et plus encore.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Recherchez votre produit
            </h2>

            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nom du produit (ex. filtre à huile, téléphone, etc.)"
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) =>
                    e.key === "Enter" && lookupParts(partSearch)
                  }
                />
              </div>
              <Button
                onClick={() => lookupParts(partSearch)}
                disabled={acLoading || !partSearch.trim()}
              >
                {acLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Rechercher"
                )}
              </Button>
            </div>

            <ResultsGrid parts={allParts} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
