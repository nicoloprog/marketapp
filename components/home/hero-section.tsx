"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
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
    <div className="results-wrap">
      <p className="results-count">
        {parts.length} article{parts.length !== 1 ? "s" : ""} trouvé
        {parts.length !== 1 ? "s" : ""}
      </p>

      <div className="results-grid">
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
          className="results-toggle"
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

  // — Search state (same logic as ShopPage) —
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

  // Search — exact same logic as ShopPage
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
    // { href: "/articles", label: "Articles en magasin", icon: ShoppingBag },
    { href: "/shop", label: "Pièces de véhicules", icon: Wrench },
    {
      href: "/construction",
      label: "Matériaux de construction",
      icon: HardHat,
    },
  ];

  return (
    <section className="hero-root">
      <div className="hero-grid" aria-hidden />
      <div className="hero-glow" aria-hidden />

      <div className="hero-inner">
        {/* Badge */}
        {/* <div className="hero-badge">
          <span className="hero-badge-dot" />
          Découvrez les prix les plus bas sur le marché
          <span className="hero-badge-dot" />
        </div> */}

        {/* Heading — fixed height stops typewriter from shifting elements below */}
        <div className="hero-heading-wrap">
          <h1 className="hero-heading">
            Un magasinage{" "}
            <span className="hero-word">
              {displayed}
              <span className="hero-cursor" />
            </span>
          </h1>
        </div>

        <p className="hero-sub">
          Remplacez vos habitudes de magasinage fastidieuses par une expérience
          fluide et agréable. En obtenant les meilleures offres.
        </p>

        {/* ── Search form (same logic as ShopPage) ── */}
        <div className="hero-search-wrap">
          <div className="hero-search-inner">
            <Search size={15} className="hero-search-icon" />
            <input
              type="text"
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupParts(partSearch)}
              placeholder="Nom du produit (ex. filtre à huile, téléphone…)"
              className="hero-search-input"
              autoComplete="off"
            />
            <button
              onClick={() => lookupParts(partSearch)}
              disabled={acLoading || !partSearch.trim()}
              className="hero-search-btn"
            >
              {acLoading ? (
                <Loader2 size={14} className="hero-search-spinner" />
              ) : (
                "Rechercher"
              )}
            </button>
          </div>
        </div>

        {/* Prompt chips */}
        <div className="prompt-shell">
          <div className="prompt-label">
            <Sparkles size={12} />
            Que cherchez-vous&nbsp;?
          </div>
          <div className="prompt-chips">
            {prompts.map(({ href, label, icon: Icon }) => (
              <Link href={href} key={href} className="prompt-chip">
                <Icon size={14} className="prompt-chip-icon" />
                {label}
                <ArrowRight size={12} className="prompt-chip-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Results — appear below the prompt shell on the same page */}
        {(acLoading || allParts.length > 0) && (
          <div className="hero-results">
            {acLoading ? (
              <div className="hero-results-loading">
                <Loader2 size={20} className="hero-search-spinner" />
                <span>Recherche en cours…</span>
              </div>
            ) : (
              <ResultsGrid parts={allParts} />
            )}
          </div>
        )}
      </div>

      <div className="hero-sep" aria-hidden />

      <style>{`
        .hero-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          background: #e4e4e4;
          font-family: 'DM Sans', 'Inter', sans-serif;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(90, 90, 90, 0.98) 0.75px, transparent 1px);
          background-size: 15px 15px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%);
        }
        .hero-glow {
          position: absolute; top: 20%; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 340px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(56, 155, 236, 0.78) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          max-width: 680px; margin: 0 auto;
          padding: 5rem 1.5rem 4rem;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 5px 16px; border-radius: 999px;
          border: 1px solid rgb(56, 191, 248); background: rgba(164, 164, 164, 0.07);
          color: #000000; font-size: 0.7rem; font-weight: 600; letter-spacing: .05em;
          margin-bottom: 2rem; font-family: 'DM Mono', monospace;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #38bdf8; box-shadow: 0 0 6px #38bdf8;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .hero-heading-wrap {
          width: 100%; min-height: 10rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.4rem;
        }
        .hero-heading {
          font-size: clamp(2.4rem, 5.5vw, 3.6rem); font-weight: 700;
          color: #5f5f5f; line-height: 1.18; letter-spacing: -.025em; margin: 0;
        }
        .hero-word {
          display: inline-flex; align-items: center; gap: 2px;
          color: #388bf8; font-style: italic; white-space: nowrap;
        }
        .hero-cursor {
          display: inline-block; width: 2px; height: 1em;
          background: #38bdf8; margin-left: 2px; border-radius: 1px;
          animation: blink .85s step-start infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .hero-sub {
          font-size: 1.05rem; line-height: 1.7; font-weight: 600; color: #3d3d3d;
          max-width: 480px; margin: 0 0 1.8rem;
        }

        /* Search bar */
        .hero-search-wrap {
          width: 100%; max-width: 480px; margin-bottom: 1.4rem;
        }
        .hero-search-inner {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 8px 8px 14px; border-radius: 14px;
          border: 1px solid rgba(56,189,248,.2);
          background: rgba(10,16,26,.7); backdrop-filter: blur(12px);
          transition: border-color .2s;
        }
        .hero-search-inner:focus-within { border-color: rgba(56,189,248,.45); }
        .hero-search-icon { color: #38bdf8; flex-shrink: 0; opacity: .6; }
        .hero-search-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #c8dcf0; caret-color: #38bdf8; min-width: 0;
        }
        .hero-search-input::placeholder { color: #ffffff; }
        .hero-search-btn {
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          min-width: 96px; padding: 7px 16px; border-radius: 9px; border: none;
          background: #388bf8; color: #fff; font-size: 0.85rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .15s, opacity .15s; letter-spacing: -.01em;
        }
        .hero-search-btn:hover:not(:disabled) { background: #388bf8; }
        .hero-search-btn:disabled { opacity: .35; cursor: default; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hero-search-spinner { animation: spin .7s linear infinite; }

        /* Prompt shell */
        .prompt-shell {
          width: 100%; max-width: 480px;
          border: 1px solid rgba(56,189,248,.18); border-radius: 16px;
          background: rgba(10,16,26,.7); backdrop-filter: blur(12px); overflow: hidden;
        }
        .prompt-label {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; font-size: 11px; font-family: 'DM Mono', monospace;
          color: #ffffff; border-bottom: 1px solid rgba(56,189,248,.1);
          letter-spacing: .05em; text-transform: uppercase;
        }
        .prompt-chips { display: flex; flex-direction: column; padding: 8px; gap: 4px; }
        .prompt-chip {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; border: 1px solid transparent; background: transparent;
          color: #ffffff; font-size: 13.5px; font-weight: 450; text-decoration: none;
          transition: background .15s, border-color .15s, color .15s;
        }
        .prompt-chip:hover {
          background: rgba(56,189,248,.07); border-color: rgba(56,189,248,.2); color: #c8dcf0;
        }
        .prompt-chip-icon { color: #388bf8; flex-shrink: 0; opacity: .75; }
        .prompt-chip-arrow {
          margin-left: auto; opacity: 0; color: #38bdf8;
          transform: translateX(-4px); transition: opacity .15s, transform .15s;
        }
        .prompt-chip:hover .prompt-chip-arrow { opacity: 1; transform: translateX(0); }

        /* Results */
        .hero-results {
          width: 100%; max-width: 900px; margin-top: 2.5rem;
          text-align: left;
        }
        .hero-results-loading {
          display: flex; align-items: center; gap: 10px;
          color: #6b7fa3; font-size: 14px;
        }
        .results-wrap { display: flex; flex-direction: column; gap: 16px; }
        .results-count { font-size: 13px; color: #6b95bb; }
        .results-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        .results-toggle {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; background: rgba(56,189,248,.15);
          color: #7dd3fc; border: none; border-radius: 8px;
          padding: 6px 14px; cursor: pointer;
          transition: background .15s;
        }
        .results-toggle:hover { background: rgba(56,189,248,.25); }

        .hero-sep {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(56,189,248,.2), transparent);
        }
        @media (max-width: 600px) {
          .hero-inner { padding: 4rem 1rem 3rem; }
          .hero-heading { font-size: 2rem; }
          .hero-heading-wrap { min-height: 6rem; }
        }
      `}</style>
    </section>
  );
}
