"use client";

import { useState, useCallback } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { Search, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type RetailerSource =
  | "amazon"
  | "walmart"
  | "rockauto"
  | "homedepot"
  | "bestbuy"
  | "target";

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

// ── Retailer config ───────────────────────────────────────────────────────────
const RETAILERS: Record<
  RetailerSource,
  { label: string; color: string; logo: React.ReactNode }
> = {
  amazon: {
    label: "Amazon",
    color: "text-[#FF9900]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-[#FF9900]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.699-3.182v.685zm3.186 7.705a.659.659 0 0 1-.748.074c-1.051-.873-1.24-1.278-1.814-2.111-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.059-1.642-.384-2.294-.384-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.97 2.705 8.921 1.7 11.583 1.7c1.364 0 3.147.362 4.222 1.394 1.364 1.27 1.232 2.967 1.232 4.814v4.361c0 1.311.545 1.886 1.056 2.594.181.254.221.559-.01.747l-2.939 2.485z" />
        <path d="M20.824 17.772c-3.223 2.33-7.9 3.573-11.92 3.573-5.639 0-10.716-2.086-14.554-5.553-.301-.272-.032-.643.33-.432 4.146 2.413 9.269 3.865 14.568 3.865 3.572 0 7.5-.739 11.115-2.271.546-.232 1.003.358.461.818z" />
      </svg>
    ),
  },
  walmart: {
    label: "Walmart",
    color: "text-[#0071CE]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-[#0071CE]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.018 0L8.458 8.515 5.9 0 0 1.702l3.81 9.12L0 11.892l5.9 1.569 2.558-8.515 2.56 8.515L17 11.892l-3.81-1.07L17 1.702zM12 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-4.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-4.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
      </svg>
    ),
  },
  rockauto: {
    label: "RockAuto",
    color: "text-[#CC0000]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-[#CC0000]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm-2 4v2H8v6h2v-3h1l2 3h2l-2.2-3.2A2 2 0 0 0 14 11V10a2 2 0 0 0-2-2h-2zm0 2h2a.5.5 0 0 1 0 1h-2v-1z" />
      </svg>
    ),
  },
  homedepot: {
    label: "Home Depot",
    color: "text-[#F96302]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-[#F96302]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7L12 19.82 4 15.5v-7L12 4.18z" />
      </svg>
    ),
  },
  bestbuy: {
    label: "Best Buy",
    color: "text-[#003087]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="3" fill="#003087" />
        <path
          d="M5 7h4c1.7 0 2.8 1 2.8 2.4 0 .9-.4 1.6-1.1 2 .9.3 1.5 1.1 1.5 2.1C12.2 15.1 11 16 9.2 16H5V7zm2 3.5h1.7c.7 0 1-.3 1-.9s-.3-.9-1-.9H7v1.8zm0 3.8h2c.8 0 1.2-.4 1.2-1s-.4-1-1.2-1H7v2zm7.5-6.3h2l1.5 5 1.5-5h2L19 16h-2l-2.5-8z"
          fill="white"
        />
      </svg>
    ),
  },
  target: {
    label: "Target",
    color: "text-[#CC0000]",
    logo: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-[#CC0000]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4zm0 3a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
      </svg>
    ),
  },
};

// ── Placeholder image ─────────────────────────────────────────────────────────
function ImagePlaceholder() {
  return (
    <div className="w-full h-36 rounded-md bg-muted flex items-center justify-center">
      <svg
        className="h-8 w-8 text-muted-foreground/40"
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
function PartCard({ part }: { part: AutoCarePart }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={part.link ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow ${
        part.link ? "hover:shadow-md cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Image */}
      {part.thumbnail && !imgError ? (
        <div className="w-full h-36 bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={part.thumbnail}
            alt={part.partTerminologyName}
            className="w-full h-full object-contain p-2"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="px-4 pt-4">
          <ImagePlaceholder />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {part.partTerminologyName}
          </h3>
          {part.price ? (
            <span className="text-sm font-bold whitespace-nowrap text-primary">
              {formatPrice(part.price)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              See site
            </span>
          )}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase">
          {part.brandLabel} — {part.partNumber}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {part.description}
        </p>
      </div>
    </a>
  );
}

// ── Parts grid ────────────────────────────────────────────────────────────────
const PREVIEW = 3;

function PartsGrid({
  source,
  parts,
}: {
  source: RetailerSource;
  parts: AutoCarePart[];
}) {
  const [expanded, setExpanded] = useState(false);
  const { label, color, logo } = RETAILERS[source];

  if (parts.length === 0) return null;

  const visible = expanded ? parts : parts.slice(0, PREVIEW);
  const hiddenCount = parts.length - PREVIEW;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
        {logo}
        {label}
        <span className="text-muted-foreground font-normal">
          ({parts.length} results)
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((part, i) => (
          <PartCard key={i} part={part} />
        ))}
      </div>

      {parts.length > PREVIEW && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show {hiddenCount} more
              result{hiddenCount !== 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type PartsState = Record<RetailerSource, AutoCarePart[]>;

const EMPTY_STATE: PartsState = {
  amazon: [],
  walmart: [],
  rockauto: [],
  homedepot: [],
  bestbuy: [],
  target: [],
};

export default function ShopPage() {
  const [parts, setParts] = useState<PartsState>(EMPTY_STATE);
  const [acLoading, setAcLoading] = useState(false);
  const [partSearch, setPartSearch] = useState("");

  const sortByPrice = (arr: AutoCarePart[]) =>
    [...arr].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

  const lookupParts = useCallback(async (term: string) => {
    if (!term.trim()) {
      toast.error("Please enter a part name");
      return;
    }

    setAcLoading(true);
    setParts(EMPTY_STATE);

    try {
      const res = await fetch(
        `/api/searcharticles?${new URLSearchParams({ q: term.trim() })}`,
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const mapPart = (item: any, source: RetailerSource): AutoCarePart => ({
        partTerminologyName: item.partTerminologyName ?? "No Title",
        brandLabel: item.brandLabel ?? "Unknown",
        partNumber: item.partNumber ?? "N/A",
        description: item.description ?? "",
        price:
          typeof item.price === "string"
            ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
            : typeof item.price === "number"
              ? item.price
              : undefined,
        link: item.link ?? undefined,
        thumbnail: item.thumbnail ?? undefined,
        source,
      });

      setParts({
        amazon: sortByPrice(
          (data.amazon || []).map((i: any) => mapPart(i, "amazon")),
        ),
        walmart: sortByPrice(
          (data.walmart || []).map((i: any) => mapPart(i, "walmart")),
        ),
        rockauto: sortByPrice(
          (data.rockauto || []).map((i: any) => mapPart(i, "rockauto")),
        ),
        homedepot: sortByPrice(
          (data.homedepot || []).map((i: any) => mapPart(i, "homedepot")),
        ),
        bestbuy: sortByPrice(
          (data.bestbuy || []).map((i: any) => mapPart(i, "bestbuy")),
        ),
        target: sortByPrice(
          (data.target || []).map((i: any) => mapPart(i, "target")),
        ),
      });

      const total = Object.values(data).flat().length;
      if (total === 0) toast.info("No parts found for this search.");
    } catch (err: any) {
      console.error("Lookup error:", err);
      toast.error("Failed to fetch parts. Check console logs.");
    } finally {
      setAcLoading(false);
    }
  }, []);

  const hasResults = Object.values(parts).some((arr) => arr.length > 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 space-y-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">
              Trouver votre produits au meilleur prix
            </h1>
            <p className="mt-2 text-muted-foreground">
              Entrez le nom du produit pour comparer les résultats sur Amazon,
              Walmart, RockAuto, Home Depot, Best Buy et Target.
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
                  placeholder="Nom du produit (ex. Cellulaire, Céréales, etc.)"
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
                  "Search"
                )}
              </Button>
            </div>

            {hasResults && (
              <div className="space-y-10">
                {(Object.keys(RETAILERS) as RetailerSource[]).map((source) => (
                  <PartsGrid
                    key={source}
                    source={source}
                    parts={parts[source]}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
