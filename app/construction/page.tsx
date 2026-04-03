"use client";

import { useState, useCallback } from "react";
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
import { toast } from "sonner";

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
        Amazon.ca
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
      className={`relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all group ${
        item.link
          ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          : "cursor-default"
      } ${isCheapest ? "ring-2 ring-green-500 dark:ring-green-500" : ""}`}
    >
      {isCheapest && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
          Meilleur prix
        </div>
      )}

      {item.thumbnail && !imgError ? (
        <div className="w-full h-40 bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.partTerminologyName}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <ImagePlaceholder />
      )}

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {item.source === "shopping" && (
              <span className="text-[10px] text-muted-foreground truncate">
                {item.brandLabel}
              </span>
            )}
            <SourceBadge source={item.source} />
          </div>
          {item.link && (
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          )}
        </div>

        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
          {item.partTerminologyName}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          {item.price != null ? (
            <div className="flex items-baseline gap-1">
              <span
                className={`text-base font-bold ${isCheapest ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
              >
                {formatPrice(item.price)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
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

  // Form state
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("unité(s)");
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState("po");

  const searchMaterials = useCallback(async () => {
    if (!material.trim()) {
      toast.error("Veuillez entrer un matériau");
      return;
    }

    setLoading(true);
    setResults([]);

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
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      setLastQuery(data.query ?? material);

      const mapItem = (item: any, source: RetailerSource): MaterialResult => ({
        partTerminologyName:
          item.partTerminologyName ?? item.title ?? "Sans titre",
        brandLabel: item.brandLabel ?? item.brand ?? item.source ?? "Inconnu",
        partNumber: item.partNumber ?? item.asin ?? "S/O",
        description: item.description ?? item.title ?? "",
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

      const merged = [
        ...(data.amazon || []).map((i: any) => mapItem(i, "amazon")),
        ...(data.shopping || []).map((i: any) => mapItem(i, "shopping")),
      ].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

      setResults(merged);
      if (merged.length === 0) toast.info("Aucun résultat trouvé.");
    } catch (err: any) {
      console.error("Search error:", err);
      toast.error("Échec de la recherche. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  }, [material, category, quantity, unit, size, sizeUnit]);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#e4e4e4] font-sans">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none" // ← fix #1
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(90,90,90,0.98) 0.75px, transparent 1px)",
          backgroundSize: "27px 27px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
        }}
      />
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center py-22 px-4">
        <div className="w-full max-w-3xl space-y-12">
          {/* ── Header ── */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
              <HardHat className="h-6 w-6 text-gray-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-600 sm:text-5xl">
              De quoi avez-vous <span className="text-primary">besoin ?</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              Comparez les prix des matériaux de construction instantanément.
            </p>
          </div>

          {/* ── AI Prompt Style Search ── */}
          <section className="relative">
            <div className="relative group bg-[#555] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-primary/50 transition-all duration-300">
              {/* Main Input */}
              <div className="flex items-center px-4 pt-2">
                <Search className="h-5 w-5 text-gray-100 mr-3" />
                <input
                  type="text"
                  placeholder="Recherchez un matériau"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchMaterials()}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-gray-100 py-3"
                />
              </div>

              {/* Secondary Controls (Pill Style) */}
              <div className="flex flex-wrap items-center gap-2 p-2 pt-0 border-t border-white/5 mt-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#222] border-none text-xs rounded-full px-3 py-1.5 text-slate-300 hover:bg-[#2a2a2a] cursor-pointer outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-[#222] rounded-full px-3 py-1">
                  <input
                    type="number"
                    placeholder="Qté"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-transparent border-none w-12 text-xs focus:ring-0 p-0"
                  />
                  <span className="text-[10px] text-slate-500 ml-1 border-l border-white/10 pl-1 uppercase">
                    {unit}
                  </span>
                </div>

                <div className="flex items-center bg-[#222] rounded-full px-3 py-1">
                  <input
                    type="text"
                    placeholder="Taille (ex: 2x4)"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-transparent border-none w-20 text-xs focus:ring-0 p-0"
                  />
                </div>

                <Button
                  onClick={searchMaterials}
                  disabled={loading || !material.trim()}
                  size="sm"
                  className="ml-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-6"
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
              {["Contreplaqué 4x8", "Béton Mélange", "2x4 Lumber"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setMaterial(suggestion)}
                    className="text-xs text-slate-500 bg-white/5 border border-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ),
              )}
            </div>
          </section>

          {/* ── Results ── */}
          <div className="pt-8">
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
  );
}
