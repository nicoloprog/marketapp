"use client";

import { useState, useCallback, useRef } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HardHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/data";
import { parsePrice } from "@/lib/price";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

// ── Types ─────────────────────────────────────────────────────────────────────
type RetailerSource = "amazon" | "shopping";

interface MaterialResult {
  partTerminologyName: string;
  brandLabel: string;
  partNumber: string;
  description: string;
  price?: number;
  link?: string;
  thumbnail?: string;
  source: RetailerSource;
}

// ── Construction material categories ─────────────────────────────────────────
const CATEGORIES = [
  { value: "", label: "Toutes catégories" },
  // Structure
  { value: "bois lumber", label: "Bois / Lumber" },
  { value: "béton concrete", label: "Béton / Concrete" },
  { value: "acier steel structure", label: "Acier / Steel" },
  {
    value: "bloc béton concrete block",
    label: "Blocs de béton / Concrete Block",
  },
  { value: "fondation foundation", label: "Fondation / Foundation" },
  // Enveloppe
  { value: "toiture roofing", label: "Toiture / Roofing" },
  { value: "revêtement siding", label: "Revêtement extérieur / Siding" },
  { value: "fenêtre window", label: "Fenêtres / Windows" },
  { value: "porte door", label: "Portes / Doors" },
  { value: "isolation insulation", label: "Isolation / Insulation" },
  {
    value: "membrane étanchéité waterproofing",
    label: "Étanchéité / Waterproofing",
  },
  // Intérieur
  { value: "gypse drywall", label: "Gypse / Drywall" },
  { value: "plancher flooring", label: "Plancher / Flooring" },
  { value: "céramique tile", label: "Céramique / Tile" },
  { value: "peinture paint", label: "Peinture / Paint" },
  { value: "moulure trim", label: "Moulures / Trim" },
  // Mécanique
  { value: "plomberie plumbing", label: "Plomberie / Plumbing" },
  { value: "électricité electrical", label: "Électricité / Electrical" },
  { value: "ventilation HVAC", label: "Ventilation / HVAC" },
  { value: "chauffage heating", label: "Chauffage / Heating" },
  // Extérieur & aménagement
  { value: "terrasse deck", label: "Terrasse / Deck" },
  { value: "clôture fence", label: "Clôture / Fence" },
  { value: "béton patio concrete patio", label: "Patio / Concrete Patio" },
  { value: "tuyau drainage pipe", label: "Drainage / Pipe" },
  // Outillage & fixation
  { value: "quincaillerie hardware", label: "Quincaillerie / Hardware" },
  { value: "visserie fasteners screws", label: "Visserie / Fasteners" },
  { value: "adhésif adhesive", label: "Adhésifs / Adhesives" },
  { value: "outil tool construction", label: "Outils / Tools" },
];

const UNITS = [
  "unité(s)",
  "pi²",
  "m²",
  "pi",
  "m",
  "sac(s)",
  "boîte(s)",
  "rouleau(x)",
  "feuille(s)",
  "gal",
  "lb",
  "kg",
  "L",
];

const SIZE_UNIT_GROUPS = [
  { group: "Longueur / Length", units: ["po", "cm", "mm", "pi", "m"] },
  { group: "Surface / Area", units: ["po²", "cm²", "pi²", "m²"] },
  { group: "Volume", units: ["po³", "cm³", "pi³", "m³"] },
  { group: "Épaisseur / Thickness", units: ["po épaisseur", "mm épaisseur"] },
];

// ── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: RetailerSource }) {
  if (source === "amazon") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[#797a7a]">
        Amazon
      </span>
    );
  }
  return <span className="inline-flex items-center gap-1 text-[10px]" />;
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

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({
  item,
  isCheapest,
}: {
  item: MaterialResult;
  isCheapest: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={item.link ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[300px] flex-col overflow-visible rounded-2xl border border-transparent bg-transparent transition-all duration-300 ${
        item.link
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

      {item.thumbnail && !imgError ? (
        <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-t-2xl border border-blue-400/15 bg-gradient-to-b from-slate-50 to-slate-200">
          <img
            src={item.thumbnail}
            alt={item.partTerminologyName}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <ImagePlaceholder />
      )}

      <div className="relative -mt-2 mx-3 mb-3 flex flex-1 flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4 shadow-[0_12px_30px_rgba(2,6,23,0.28)] backdrop-blur transition-shadow group-hover:shadow-[0_18px_42px_rgba(14,165,233,0.16)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {item.source === "shopping" && (
              <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                {item.brandLabel}
              </span>
            )}
            <SourceBadge source={item.source} />
          </div>
          {item.link && (
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-300/55 transition-colors group-hover:text-blue-200" />
          )}
        </div>

        <h3 className="line-clamp-2 min-h-[40px] flex-1 text-sm font-semibold leading-snug text-white">
          {item.partTerminologyName}
        </h3>

        <div className="mt-auto flex items-center justify-center pt-1">
          {item.price != null ? (
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
                {formatPrice(item.price)}
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
const PREVIEW = 8;

function ResultsGrid({
  items,
  query,
}: {
  items: MaterialResult[];
  query: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const cheapestPrice = items.find((p) => p.price != null)?.price;
  const visible = expanded ? items : items.slice(0, PREVIEW);
  const hiddenCount = items.length - PREVIEW;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <span>
          {items.length} résultat{items.length !== 1 ? "s" : ""}
        </span>
        {query && <span className="text-foreground/50">pour « {query} »</span>}
        {cheapestPrice != null && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            · Meilleur prix : {formatPrice(cheapestPrice)} CA$
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((item, i) => (
          <ResultCard
            key={i}
            item={item}
            isCheapest={item.price != null && item.price === cheapestPrice}
          />
        ))}
      </div>

      {items.length > PREVIEW && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="inline-flex items-center gap-1.5 text-[13px] bg-[rgba(56,189,248,0.15)] text-[#7dd3fc] border-0 rounded-lg px-[14px] py-1.5 cursor-pointer hover:bg-[rgba(56,189,248,0.25)] transition-colors duration-150"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Voir {hiddenCount}{" "}
              résultat{hiddenCount !== 1 ? "s" : ""} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopMaterialPage() {
  const [results, setResults] = useState<MaterialResult[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Form state
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("unité(s)");
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("po");

  const scrollToResults = useCallback(() => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  const searchMaterials = useCallback(async () => {
    if (!material.trim()) {
      toast.error("Veuillez entrer un matériau");
      return;
    }

    setLoading(true);
    setResults([]);
    scrollToResults();

    try {
      const res = await fetch("/api/searchmaterial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material: material.trim(),
          category,
          quantity,
          unit,
          size,
          sizeUnit,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Server returned ${res.status}`);
      }

      setLastQuery(data.query ?? material);

      const mapItem = (item: any, source: RetailerSource): MaterialResult => ({
        partTerminologyName:
          item.partTerminologyName ?? item.title ?? "Sans titre",
        brandLabel: item.brandLabel ?? item.brand ?? item.source ?? "Inconnu",
        partNumber: item.partNumber ?? item.asin ?? "S/O",
        description: item.description ?? item.title ?? "",
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

      const merged = [
        ...(data.amazon || []).map((i: any) => mapItem(i, "amazon")),
        ...(data.shopping || []).map((i: any) => mapItem(i, "shopping")),
      ].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

      setResults(merged);
      if (merged.length === 0) toast.info("Aucun résultat trouvé.");
    } catch (err: any) {
      console.error("Search error:", err);
      toast.error(err?.message || "Échec de la recherche. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  }, [material, category, quantity, scrollToResults, size, sizeUnit, unit]);

  return (
    <ProtectedRoute>
      <div className="relative min-h-[110svh] flex flex-col justify-center overflow-x-hidden font-sans">
        {/* Garage Background */}
        <div className="fixed inset-0 bg-black/60 bg-[url('/construction.png')] bg-cover bg-center bg-blend-overlay"></div>
        <SiteHeader />

        <main className="relative z-10 flex-1 flex flex-col items-center py-28 px-4">
          <div className="w-full max-w-3xl space-y-12">
            {/* ── Header ── */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
                De quoi avez-vous{" "}
                <span className="text-amber-500">besoin ?</span>
              </h1>
            </div>

            {/* ── AI Prompt Style Search ── */}
            <section className="relative">
              <div className="relative group bg-gray-600 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-primary/50 transition-all duration-300">
                {/* Main Input */}
                <div className="flex items-center px-4 pt-2">
                  <Search className="h-5 w-5 text-amber-500 mr-3" />
                  <input
                    type="text"
                    placeholder="Recherchez un matériau"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchMaterials()}
                    className="w-full bg-transparent border border-white/20 rounded focus:ring-0 text-lg placeholder:text-gray-400 p-3"
                  />
                </div>

                {/* Secondary Controls (Pill Style) */}
                <div className="flex flex-wrap items-center gap-2 p-2 pt-0 border-t border-white/5 mt-2">
                  {/* <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[#222] border-none text-xs rounded px-3 py-1.5 text-slate-300 hover:bg-[#2a2a2a] cursor-pointer outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center bg-[#222] rounded px-4 py-1.5">
                    <input
                      type="number"
                      placeholder="Qté"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-transparent border-none w-12 text-xs focus:ring-0 p-0"
                    />
                    <span className="text-[10px] text-am-400 ml-1 border-l border-white/10 pl-1 uppercase">
                      {unit}
                    </span>
                  </div>

                  <div className="flex items-center bg-[#222] rounded px-4 py-1.5">
                    <input
                      type="text"
                      placeholder="Taille (ex: 2x4)"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="bg-transparent border-none w-20 text-xs focus:ring-0 p-0"
                    />
                  </div> */}

                  <Button
                    onClick={searchMaterials}
                    disabled={loading || !material.trim()}
                    size="sm"
                    className="ml-auto mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-900 px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Rechercher"
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Suggestions (Optional) */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["Contreplaqué 4 x 8", "Béton Mélange", " bois 2 x 4 x 8"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setMaterial(suggestion)}
                      className="text-xs text-amber-500 bg-gray-600 border border-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>
            </section>

            {/* ── Results ── */}
            <div ref={resultsRef} className="pt-8 pb-16 scroll-mt-28">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                  <p className="text-slate-400 animate-pulse">
                    Analyse des meilleurs prix en cours...
                  </p>
                </div>
              )}
              {!loading && <ResultsGrid items={results} query={lastQuery} />}
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
