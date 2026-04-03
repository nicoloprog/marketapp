"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Wrench,
  HardHat,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/data";
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

// ── Typewriter words ──────────────────────────────────────────────────────────
const WORDS = ["simple", "rapide", "efficace", "intelligent"];

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
      className={`relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all group ${
        part.link
          ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          : "cursor-default"
      } ${isCheapest ? "ring-2 ring-green-500" : ""}`}
    >
      {isCheapest && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
          Meilleur prix
        </div>
      )}
      {part.thumbnail && !imgError ? (
        <div className="w-full h-40 bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={part.thumbnail}
            alt={part.partTerminologyName}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <ImagePlaceholder />
      )}

      <div className="flex flex-col gap-2 p-4 flex-1 bg-blue-950">
        <div className="flex items-center gap-1.5 min-w-0">
          {part.source === "shopping" && (
            <span className="text-[20px] text-blue-400 font-semibold truncate">
              {part.brandLabel}
            </span>
          )}
          {part.source === "amazon" && (
            <span className="text-[20px] font-semibold text-blue-400">
              Amazon.ca
            </span>
          )}
        </div>
        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
          {part.partTerminologyName}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          {part.price != null ? (
            <div className="flex items-baseline gap-1">
              <span
                className={`text-[25px] font-bold ${isCheapest ? "text-green-400" : "text-foreground"}`}
              >
                {formatPrice(part.price)}
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
const PREVIEW = 3;

function ResultsGrid({ parts }: { parts: AutoCarePart[] }) {
  const [expanded, setExpanded] = useState(false);
  if (parts.length === 0) return null;

  const cheapestPrice = parts.find((p) => p.price != null)?.price;
  const visible = expanded ? parts : parts.slice(0, PREVIEW);
  const hiddenCount = parts.length - PREVIEW;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-[#6b95bb]">
        {parts.length} article{parts.length !== 1 ? "s" : ""} trouvé
        {parts.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
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
          className="inline-flex items-center gap-1.5 text-[13px] bg-[rgba(56,189,248,0.15)] text-[#7dd3fc] border-0 rounded-lg px-[14px] py-1.5 cursor-pointer hover:bg-[rgba(56,189,248,0.25)] transition-colors duration-150"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} /> Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} /> {hiddenCount} article
              {hiddenCount !== 1 ? "s" : ""} de plus
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────
export function HeroSection() {
  // — Typewriter state —
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // — Search state —
  const [allParts, setAllParts] = useState<AutoCarePart[]>([]);
  const [acLoading, setAcLoading] = useState(false);
  const [partSearch, setPartSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!mounted) return;
    const current = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length + 1)),
        80,
      );
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length - 1)),
        45,
      );
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex, mounted]);

  // Search
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
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const mapPart = (item: any, source: RetailerSource): AutoCarePart => ({
        partTerminologyName: item.partTerminologyName ?? "Sans titre",
        brandLabel: item.brandLabel ?? "Inconnu",
        partNumber: item.partNumber ?? "S/O",
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

      const merged = [
        ...(data.amazon || []).map((i: any) => mapPart(i, "amazon")),
        ...(data.shopping || []).map((i: any) => mapPart(i, "shopping")),
      ].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

      setAllParts(merged);
      if (merged.length === 0)
        toast.info("Aucun résultat trouvé pour cette recherche.");
    } catch (err: any) {
      console.error("Lookup error:", err);
      toast.error("Échec de la recherche. Vérifiez la console.");
    } finally {
      setAcLoading(false);
    }
  }, []);

  const prompts = [
    { href: "/shop", label: "Pièces de véhicules", icon: Wrench },
    {
      href: "/construction",
      label: "Matériaux de construction",
      icon: HardHat,
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#e4e4e4] font-sans">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(90,90,90,0.98) 0.75px, transparent 1px)",
          backgroundSize: "27px 27px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      {/* Blue glow */}
      <div
        aria-hidden
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[340px] rounded-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56, 155, 236, 0.63) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[680px] mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        {/* Heading — fixed height stops typewriter from shifting elements below */}
        <div className="w-full min-h-[10rem] flex items-center justify-center mb-[1.4rem]">
          <h1
            className="font-bold text-[#5f5f5f] leading-[1.18] tracking-[-0.025em] m-0"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.6rem)" }}
          >
            Un magasinage{" "}
            <span className="inline-flex items-center gap-0.5 text-[#388bf8] italic whitespace-nowrap">
              {displayed}
              <span className="hero-cursor inline-block w-0.5 h-[1em] bg-[#38bdf8] ml-0.5 rounded-[1px]" />
            </span>
          </h1>
        </div>

        <p className="text-[1.05rem] leading-[1.7] font-semibold text-[#3d3d3d] max-w-[480px] m-0 mb-[1.8rem]">
          Remplacez vos habitudes de magasinage fastidieuses par une expérience
          fluide et agréable. En obtenant les meilleures offres.
        </p>

        {/* ── Search form ── */}
        <div className="w-full max-w-[480px] mb-[1.4rem]">
          <div className="hero-search-inner flex items-center gap-2.5 py-2 pr-2 pl-[14px] rounded-[14px] border border-[rgba(56,189,248,0.2)] bg-[rgba(10,16,26,0.7)] backdrop-blur-md transition-colors duration-200">
            <Search
              size={15}
              className="text-[#38bdf8] flex-shrink-0 opacity-60"
            />
            <input
              type="text"
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupParts(partSearch)}
              placeholder="Nom du produit (ex. filtre à huile, téléphone…)"
              autoComplete="off"
              className="flex-1 bg-transparent border-0 outline-none text-[13.5px] text-[#c8dcf0] caret-[#38bdf8] min-w-0 placeholder:text-white font-sans"
            />
            <button
              onClick={() => lookupParts(partSearch)}
              disabled={acLoading || !partSearch.trim()}
              className="flex-shrink-0 flex items-center justify-center min-w-24 px-4 py-[7px] rounded-[9px] border-0 bg-[#388bf8] text-white text-[0.85rem] font-semibold cursor-pointer hover:bg-[#2d7de0] disabled:opacity-35 disabled:cursor-default transition-[background,opacity] duration-150 tracking-[-0.01em] font-sans"
            >
              {acLoading ? (
                <Loader2 size={14} className="hero-spinner" />
              ) : (
                "Rechercher"
              )}
            </button>
          </div>
        </div>

        {/* Prompt chips */}
        <div className="w-full max-w-[480px] border border-[rgba(56,189,248,0.18)] rounded-[16px] bg-[rgba(10,16,26,0.7)] backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-[10px] text-[11px] text-white border-b border-[rgba(56,189,248,0.1)] tracking-[0.05em] uppercase">
            <Sparkles size={12} />
            Que cherchez-vous&nbsp;?
          </div>
          <div className="flex flex-col p-2 gap-1">
            {prompts.map(({ href, label, icon: Icon }) => (
              <Link
                href={href}
                key={href}
                className="group flex items-center gap-2.5 px-[14px] py-[10px] rounded-[10px] border border-transparent bg-transparent text-white text-[13.5px] font-[450] no-underline hover:bg-[rgba(56,189,248,0.07)] hover:border-[rgba(56,189,248,0.2)] hover:text-[#c8dcf0] transition-[background,border-color,color] duration-150"
              >
                <Icon
                  size={14}
                  className="text-[#388bf8] flex-shrink-0 opacity-75"
                />
                {label}
                <ArrowRight
                  size={12}
                  className="ml-auto opacity-0 text-[#38bdf8] -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        {(acLoading || allParts.length > 0) && (
          <div className="w-full max-w-[900px] mt-10 text-left">
            {acLoading ? (
              <div className="flex items-center gap-2.5 text-[#6b7fa3] text-sm">
                <Loader2 size={20} className="hero-spinner" />
                <span>Recherche en cours…</span>
              </div>
            ) : (
              <ResultsGrid parts={allParts} />
            )}
          </div>
        )}
      </div>

      {/* Bottom separator */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(56,189,248,0.2), transparent)",
        }}
      />

      {/* Minimal style block — only for what Tailwind cannot express */}
      <style>{`
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        .hero-cursor { animation: blink .85s step-start infinite; }
        .hero-spinner { animation: spin .7s linear infinite; }

        .hero-search-inner:focus-within {
          border-color: rgba(56,189,248,0.45);
        }
      `}</style>
    </section>
  );
}
