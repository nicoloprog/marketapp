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
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

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

interface CQData {
  makeId: string;
  modelId: string;
  trimId: string;
  body: string;
  doors: string;
  cylinders: string;
  displacement: string;
  horsepower: string;
  torque: string;
  fuel: string;
  drive: string;
  transmission: string;
  weight: string;
}

interface VehicleData {
  vin: string;
  make: string;
  model: string;
  year: string;
  manufacturer: string;
  bodyClass: string;
  engineModel: string;
  fuelType: string;
  trim: string;
  cq?: CQData;
  source: "cache" | "live";
}

// ── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: RetailerSource }) {
  if (source === "amazon") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[#797a7a]">
        Amazon.ca
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px]">
      {/* brandLabel is the actual store name from Google Shopping */}
    </span>
  );
}

// ── Step badge ────────────────────────────────────────────────────────────────
function StepBadge({
  step,
  label,
  status,
}: {
  step: number;
  label: string;
  status: "idle" | "loading" | "done" | "error";
}) {
  const colors: Record<typeof status, string> = {
    idle: "bg-muted text-muted-foreground",
    loading:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}
    >
      {status === "loading" && <Loader2 className="h-3 w-3 animate-spin" />}
      <span className="opacity-60">Étape {step}</span> {label}
    </span>
  );
}

// ── VehicleCard ───────────────────────────────────────────────────────────────
function VehicleCard({ v }: { v: VehicleData }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border bg-card p-4 text-sm space-y-3 max-w-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-primary" />
          <span className="font-semibold uppercase">
            {v.year} {v.make} {v.model}
          </span>
          {v.trim && (
            <Badge variant="secondary" className="text-xs">
              {v.trim}
            </Badge>
          )}
        </div>
        <Badge
          variant={v.source === "cache" ? "outline" : "default"}
          className="text-xs"
        >
          {v.source === "cache" ? "cached" : "live"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">Manufacturier</strong>:{" "}
          {v.manufacturer}
        </span>
        <span>
          <strong className="text-foreground">Carrosserie</strong>:{" "}
          {v.bodyClass}
        </span>
        <span>
          <strong className="text-foreground">Moteur</strong>:{" "}
          {v.engineModel || "—"}
        </span>
        <span>
          <strong className="text-foreground">Carburant</strong>:{" "}
          {v.fuelType || "—"}
        </span>
      </div>
      {v.cq && (
        <>
          <button
            onClick={() => setExpanded((x) => !x)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Zap className="h-3 w-3" /> Données techniques{" "}
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {expanded && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground border-t pt-2">
              <span>
                <strong className="text-foreground">Drive</strong>:{" "}
                {v.cq.drive || "—"}
              </span>
              <span>
                <strong className="text-foreground">Trans</strong>:{" "}
                {v.cq.transmission || "—"}
              </span>
              <span>
                <strong className="text-foreground">Cyl</strong>:{" "}
                {v.cq.cylinders || "—"}
              </span>
              <span>
                <strong className="text-foreground">Disp</strong>:{" "}
                {v.cq.displacement ? `${v.cq.displacement} cc` : "—"}
              </span>
              <span>
                <strong className="text-foreground">HP</strong>:{" "}
                {v.cq.horsepower ? `${v.cq.horsepower} PS` : "—"}
              </span>
              <span>
                <strong className="text-foreground">Poids</strong>:{" "}
                {v.cq.weight ? `${v.cq.weight} kg` : "—"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
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
      className={`relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all group ${
        part.link
          ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          : "cursor-default"
      } ${isCheapest ? "ring-2 ring-green-500 dark:ring-green-500" : ""}`}
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

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {part.source === "shopping" && (
              <span className="text-[10px] text-muted-foreground truncate">
                {part.brandLabel}
              </span>
            )}
            <SourceBadge source={part.source} />
          </div>
          {part.link && (
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          )}
        </div>

        <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
          {part.partTerminologyName}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          {part.price != null ? (
            <div className="flex items-baseline gap-1">
              <span
                className={`text-base font-bold ${isCheapest ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
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
const PREVIEW = 8;

function ResultsGrid({ parts }: { parts: AutoCarePart[] }) {
  const [expanded, setExpanded] = useState(false);
  if (parts.length === 0) return null;

  const cheapestPrice = parts.find((p) => p.price != null)?.price;
  const visible = expanded ? parts : parts.slice(0, PREVIEW);
  const hiddenCount = parts.length - PREVIEW;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {parts.length} résultat{parts.length !== 1 ? "s" : ""}
        </span>
        {cheapestPrice != null && (
          <span className="text-green-600 dark:text-green-400 font-medium">
            · Meilleur prix : {formatPrice(cheapestPrice)} CA$
          </span>
        )}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [allParts, setAllParts] = useState<AutoCarePart[]>([]);
  const [acLoading, setAcLoading] = useState(false);
  const [partSearch, setPartSearch] = useState("");

  // VIN state
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [vinSteps, setVinSteps] = useState<{
    nhtsa: "idle" | "loading" | "done" | "error";
    carquery: "idle" | "loading" | "done" | "error";
  }>({ nhtsa: "idle", carquery: "idle" });
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  // ── Lookup parts via POST /api/search ──────────────────────────────────────
  const lookupParts = useCallback(
    async (term: string, m?: string, mo?: string, y?: string) => {
      if (!term.trim()) {
        toast.error("Veuillez entrer un nom de produit");
        return;
      }

      setAcLoading(true);
      setAllParts([]);

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: y ?? year,
            make: m ?? make,
            model: mo ?? model,
            partName: term.trim(),
          }),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();

        const mapPart = (item: any, source: RetailerSource): AutoCarePart => ({
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
    },
    [make, model, year],
  );

  // ── Enrich with vehicle specs ──────────────────────────────────────────────
  const enrichVehicleData = async (targetVin: string) => {
    setVinSteps((prev) => ({ ...prev, carquery: "loading" }));
    try {
      const res = await fetch(`/api/vehicle-specs?vin=${targetVin}`);
      if (!res.ok) throw new Error("Spec lookup failed");
      const data = await res.json();
      const specs: CQData = {
        makeId: data.MakeID || "",
        modelId: data.ModelID || "",
        trimId: data.Trim || "",
        body: data.BodyClass || "",
        doors: data.Doors || "",
        cylinders: data.EngineCylinders || "",
        displacement: data.DisplacementCC || "",
        horsepower: data.Horsepower || "",
        torque: "",
        fuel: data.FuelTypePrimary || "",
        drive: data.DriveType || "",
        transmission: data.TransmissionStyle || "",
        weight: data.GVWR || "",
      };
      setVehicle((prev) => (prev ? { ...prev, cq: specs } : null));
      setVinSteps((prev) => ({ ...prev, carquery: "done" }));
    } catch {
      setVinSteps((prev) => ({ ...prev, carquery: "error" }));
    }
  };

  // ── Decode VIN ─────────────────────────────────────────────────────────────
  const decodeVIN = async () => {
    if (!vin || vin.length !== 17)
      return toast.error("Entrez un VIN valide (17 caractères)");
    setVinSteps({ nhtsa: "loading", carquery: "idle" });
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${vin}?format=xml`,
      );
      const xmlText = await res.text();
      const xmlDoc = new DOMParser().parseFromString(
        xmlText,
        "application/xml",
      );
      const getVal = (tag: string) =>
        xmlDoc.getElementsByTagName(tag)[0]?.textContent || "";

      const rawMake = getVal("Make");
      const rawModel = getVal("Model").split(" ")[0].toUpperCase();
      const yearVal = getVal("ModelYear");

      if (!rawMake) {
        setVinSteps({ nhtsa: "error", carquery: "idle" });
        return toast.error("VIN invalide");
      }

      setVehicle({
        vin,
        make: rawMake.toUpperCase(),
        model: rawModel,
        year: yearVal,
        manufacturer: getVal("Manufacturer"),
        bodyClass: getVal("BodyClass"),
        engineModel: getVal("EngineModel"),
        fuelType: getVal("FuelTypePrimary"),
        trim: getVal("Trim"),
        source: "live",
      });
      setMake(rawMake.toUpperCase());
      setModel(rawModel);
      setYear(yearVal);
      setVinSteps({ nhtsa: "done", carquery: "idle" });
      toast.success(`Identifié : ${rawMake} ${rawModel} ${yearVal}`);
      await enrichVehicleData(vin);
    } catch {
      setVinSteps({ nhtsa: "error", carquery: "idle" });
      toast.error("Échec du décodage VIN");
    }
  };

  const showPartSearch = vehicle || (make && model && year);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#e4e4e4] font-sans">
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

        <SiteHeader />

        <main className="flex-1 flex flex-col items-center py-32 px-4">
          <div className="w-full max-w-4xl space-y-10">
            {/* ── Header: Minimalist & Tech-focused ── */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs  tracking-widest uppercase">
                <Zap className="h-3 w-3" /> Pièces de vehicules
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl bg-gradient-to-b from-gray-400 to-gray-600 bg-clip-text text-transparent">
                Identifiez. <span className="text-[#388bf8]">Trouvez.</span>{" "}
                Réparez.
              </h1>
            </div>

            {/* ── Step 1: The VIN "Prompt" ── */}
            <section className="relative max-w-2xl mx-auto w-full">
              <div className="relative group bg-[rgba(10,16,26,0.7)] border border-white/10 rounded-2xl p-2 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] focus-within:ring-1 ring-primary/50 transition-all">
                <div className="flex items-center px-4 py-2">
                  <Car className="h-5 w-5 text-white mr-3" />
                  <input
                    type="text"
                    placeholder="Entrez votre VIN ..."
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    onKeyDown={(e) => e.key === "Enter" && decodeVIN()}
                    className="w-full bg-transparent border-none focus:ring-0 text-md  placeholder:text-gray-100 py-3 tracking-widest"
                  />
                  <Button
                    onClick={decodeVIN}
                    disabled={vin.length !== 17 || vinSteps.nhtsa === "loading"}
                    size="sm"
                    className="rounded-xl bg-white text-black hover:bg-slate-200"
                  >
                    {vinSteps.nhtsa === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Identifier"
                    )}
                  </Button>
                </div>

                {/* Real-time Status Indicators */}
                <div className="flex gap-4 px-4 pb-2 border-t border-white/5 pt-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${vinSteps.nhtsa === "done" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-700"}`}
                    />
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                      NHTSA Database
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${vinSteps.carquery === "done" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-700"}`}
                    />
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                      Engine Specs
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Step 2: Vehicle Insight & Part Search ── */}
            {showPartSearch && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                {/* Sleek Vehicle Status Card */}
                {vehicle && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">
                        Véhicule Détecté
                      </p>
                      <h3 className="text-gray-600 text-xl font-bold">
                        {vehicle.year} {vehicle.make}
                      </h3>
                      <p className="text-gray-600 text-sm ">
                        {vehicle.model} {vehicle.trim}
                      </p>
                    </div>
                    <div className="md:border-l border-white/10 md:pl-6 space-y-2">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">
                        Moteur & Transmission
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Type: {vehicle.engineModel || "N/A"}</p>
                        <p>Carburant: {vehicle.fuelType || "N/A"}</p>
                        {vehicle.cq && <p>Traction: {vehicle.cq.drive}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Part Search "Prompt" */}
                <div className="max-w-2xl mx-auto w-full space-y-4">
                  <div className="relative group bg-primary/35 border border-primary/20 rounded-2xl p-2 focus-within:border-primary/50 transition-all">
                    <div className="flex items-center px-4 py-1">
                      <Search className="h-5 w-5 text-gray-600 mr-3" />
                      <input
                        type="text"
                        placeholder="Quelle pièce recherchez-vous ? (ex: Disques de frein)"
                        value={partSearch}
                        onChange={(e) => setPartSearch(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && lookupParts(partSearch)
                        }
                        className="w-full text-gray-600 bg-transparent border-none focus:ring-0 text-lg placeholder:text-gray-600 py-3"
                      />
                      <Button
                        onClick={() => lookupParts(partSearch)}
                        disabled={acLoading || !partSearch.trim()}
                        variant="ghost"
                        className="hover:bg-primary/20 text-gray-600"
                      >
                        {acLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="flex gap-2 justify-center">
                    {[
                      "Filtre à huile",
                      "Bougies",
                      "Plaquettes",
                      "Batterie",
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setPartSearch(tag);
                          lookupParts(tag);
                        }}
                        className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-md border border-white/5 text-gray-600 hover:text-white hover:bg-white/5 transition-all"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Grid */}
                <div className="pt-4">
                  <ResultsGrid parts={allParts} />
                </div>
              </div>
            )}
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
