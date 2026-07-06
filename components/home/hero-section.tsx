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
  ExternalLink,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";
import { useAuth } from "@/lib/store";

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
const WORDS = ["pas cher", "intelligent", "simple", "rapide"];

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
      className={`group relative flex flex-col overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-300 ${
        isCheapest ? "border-[#61fa7d55]" : "border-[#38bdf81f] bg-[#0a101a99]"
      } ${
        part.link
          ? "hover:-translate-y-1.5 hover:border-[rgba(56,189,248,0.4)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.15)] cursor-pointer"
          : "cursor-default"
      }`}
    >
      {/* Best price ribbon */}
      {isCheapest && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#4ade80]/60 to-[#4ade80]/50 pl-1.5 pr-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black/70 shadow-[0_2px_10px_rgba(74,222,128,0.4)]">
          <Sparkles size={12} strokeWidth={2.5} />
          meilleur prix
        </div>
      )}

      {/* Image */}
      {part.thumbnail && !imgError ? (
        <div className="relative w-full h-44 overflow-hidden bg-[#0a0f18]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-transparent to-transparent opacity-60 z-[1]" />
          <img
            src={part.thumbnail}
            alt={part.partTerminologyName}
            className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <ImagePlaceholder />
      )}

      {/* Content */}
      <div className="flex flex-1 bg-gradient-to-b from-[#3a332f]/80 via-[#1c1816]/95 to-[#0f0d0d] backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.1)] flex-col gap-3 p-5 rounded-b-3xl">
        {/* Source / brand */}
        <div className="flex items-center gap-1.5 min-w-0">
          {part.source === "shopping" && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60 truncate border border-[#2174e8bf] px-2 py-0.5">
              {part.brandLabel}
            </span>
          )}
          {part.source === "amazon" && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#38bdf8]/80">
              Amazon.ca
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="
    flex-1
    line-clamp-2
    text-[16.5px]
    font-semibold
    leading-snug
    bg-gradient-to-b
    from-white
    via-[#f2f7ff]
    to-[#bfd2ee]
    bg-clip-text
    text-transparent
    drop-shadow-[0_1px_6px_ #ffffff1f]
  "
        >
          {part.partTerminologyName}
        </h3>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
          {part.price != null ? (
            <div className="flex items-baseline gap-1 ml-auto text-right">
              <span
                className={`text-[22px] font-bold tracking-tight ${
                  isCheapest ? "text-[#4ade80]/80" : "text-[#e2ecfb]"
                }`}
              >
                {formatPrice(part.price)}
              </span>
              <span className="text-[10px] text-gray-300 font-medium">CA$</span>
            </div>
          ) : (
            <span className="text-xs text-[#6b7fa3] italic ml-auto">
              Voir le site
            </span>
          )}

          <ExternalLink
            size={14}
            className="text-[#38bdf8] opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:translate-x-0"
          />
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
  const { user, isPaid } = useAuth();
  const [showLockMsg, setShowLockMsg] = useState(false);

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
    <section className="relative justify-center min-h-[100svh] overflow-hidden">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 z-[-1] overflow-hidden bg-[#02040a]" // Pure deep ocean abyss black
      >
        {/* Layer 1: Subtle Deep Sea Trench Glow (Extremely dark blue gradient) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #052e5c 5%,#031129 30%, #031129 75%, #052e5c 100%)",
          }}
        />

        {/* Layer 2: Gemini-style ambient waterline reflection at the very bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 120%, rgba(14, 165, 233, 0.25) 0%, rgba(3, 105, 161, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>
      {!acLoading && allParts.length === 0 && (
        <div className="relative z-10 max-w-[680px] mx-auto min-h-[100svh] px-6 pt-12 md:pt-24 pb-10 md:pb-16 flex flex-col items-center justify-center text-center transition-opacity duration-300">
          <p className="text-[1.25rem] leading-[1.25] text-white/85 max-w-[500px] m-0 mb-[1.8rem]">
            Obtenez les meilleures offres sur <strong>l'épicerie</strong>,
            <strong>vêtements</strong>,<strong> pièces automobiles</strong>,
            <strong> matériaux de construction</strong> et plus encore.
          </p>
          <div className="w-full max-w-[480px] border border-[rgba(56,189,248,0.18)] rounded-[8px] bg-[rgba(10,16,26,0.7)] backdrop-blur-md overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-[10px] text-[9px] text-white border-b border-[rgba(56,189,248,0.1)] tracking-[0.05em] uppercase">
              <Sparkles size={11} />
              Recherche avancée
            </div>
            <div className="flex flex-col p-2 gap-1">
              {prompts.map(({ href, label, icon: Icon }) => (
                <Link
                  href={href}
                  key={href}
                  className="group flex items-center gap-2.5 px-[14px] py-[10px] rounded-[10px] border border-transparent bg-transparent text-white text-[14px] font-[450] no-underline hover:bg-[rgba(56,189,248,0.07)] hover:border-[rgba(56,189,248,0.2)] hover:text-[#c8dcf0] transition-[background,border-color,color] duration-150"
                >
                  <Icon
                    size={14}
                    className="text-[#388bf8] flex-shrink-0 opacity-75"
                  />
                  {label}
                  <ArrowRight
                    size={10}
                    className="ml-auto opacity-0 text-[#38bdf8] -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ── Results panel — takes over the space once there's something to show ── */}
      <div className="custom-scrollbar fixed inset-x-0 top-12 bottom-54 mx-auto w-full max-w-[98%] overflow-y-auto p-6 z-10">
        {(acLoading || allParts.length > 0) && (
          <div className="w-full max-w-[900px] mt-6 text-left mx-auto">
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
      {/* ── Search form ── */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[90%] md:max-w-[680px] z-20">
        <div className="relative">
          <div
            className={`group flex items-center gap-2.5 py-2 pr-3.5 pl-[14px] rounded-[50px] border border-[#2073e893] bg-[rgba(10,16,26,0.7)] backdrop-blur-md transition-colors duration-200 focus-within:border-[#2073e8] ${
              !isPaid ? "opacity-60 select-none" : ""
            }`}
          >
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={partSearch}
                onChange={(e) => isPaid && setPartSearch(e.target.value)}
                onKeyDown={(e) =>
                  isPaid && e.key === "Enter" && lookupParts(partSearch)
                }
                onFocus={() => !isPaid && setShowLockMsg(true)}
                placeholder="Nom du produit (ex. téléphone…)"
                autoComplete="off"
                readOnly={!isPaid}
                className="peer w-full bg-transparent border-0 pl-4 py-4 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 text-[16.5px] text-[#c8dcf0] caret-[#38bdf8] min-w-0 placeholder:text-white/80 font-sans"
              />

              {/* Base underline */}
              <div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-[#2174e87a] to-transparent" />

              {/* Focus underline */}
              <div className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-[#2073e8] to-transparent scale-x-0 peer-focus:scale-x-100 transition-transform duration-300 ease-out origin-center" />
            </div>

            <button
              onClick={() =>
                isPaid ? lookupParts(partSearch) : setShowLockMsg(true)
              }
              disabled={isPaid && (acLoading || !partSearch.trim())}
              className="flex-shrink-0 flex items-center justify-center max-w-4 px-6 py-3.5 rounded-[50px] border-0 bg-[#388bf8] text-white text-[0.85rem] font-semibold cursor-pointer hover:bg-[#2d7de0] disabled:opacity-75 disabled:cursor-default transition-[background,opacity] duration-150 tracking-[-0.01em] font-sans"
            >
              {acLoading ? (
                <Loader2 size={14} className="hero-spinner" />
              ) : (
                <Search size={20} className="text-white-90 flex-shrink-0" />
              )}
            </button>
          </div>
          {/* Quick Suggestions (Optional) */}
          {/* <div className="mt-4 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {[
              "Téléphone intelligent",
              "Filet mignon de boeuf",
              "Chaise flottante",
              "Télévision 4K",
              "Casque de vélo",
              "ballon de football",
              "Parapluie pliable",
              "Montre connectée",
              "Sac à dos étanche",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPartSearch(suggestion)}
                className="text-xs text-gray-300 bg-gray-700/30 border border-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div> */}

          {/* Invisible click-catcher for non-paid users */}
          {!isPaid && (
            <div
              className="absolute inset-0 cursor-pointer rounded-[14px]"
              onClick={() => setShowLockMsg(true)}
            />
          )}
        </div>
        {/* Inline lock message */}
        {showLockMsg && !isPaid && (
          <div className="mt-2 flex items-center gap-2 rounded-[8px] bg-blue-100/60 border border-[rgba(29, 29, 29, 0.3)] px-4 py-2.5 text-[12.5px] text-[#000000]">
            <span>🔒</span>
            <span>
              Cette fonctionnalité est réservée aux membres payants.{" "}
              <Link
                href="/register"
                className="underline font-semibold hover:text-yellow-300 transition-colors"
              >
                Créer un compte
              </Link>{" "}
              ou{" "}
              <Link
                href="/login"
                className="underline font-semibold hover:text-yellow-300 transition-colors"
              >
                se connecter
              </Link>
              .
            </span>
            <span>🔒</span>
          </div>
        )}
      </div>{" "}
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
