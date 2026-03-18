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
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 py-16">
        <div className="mx-auto max-w-7xl px-4 space-y-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Magasin de pièces</h1>
            <p className="mt-2 text-muted-foreground">
              Décodez votre VIN puis recherchez des pièces — prix comparés sur
              Amazon.ca et Google Shopping.
            </p>
          </div>

          {/* ── Step 1: VIN ── */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" /> Identifier votre véhicule
            </h2>
            <div className="flex gap-2 max-w-lg">
              <Input
                placeholder="Entrer le VIN (17 caractères)"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                maxLength={17}
                className=""
              />
              <Button
                onClick={decodeVIN}
                disabled={vin.length !== 17 || vinSteps.nhtsa === "loading"}
                variant="secondary"
              >
                {vinSteps.nhtsa === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Décoder VIN"
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <StepBadge step={1} label="NHTSA" status={vinSteps.nhtsa} />
              <StepBadge step={2} label="Specs" status={vinSteps.carquery} />
            </div>
            {vehicle && <VehicleCard v={vehicle} />}

            {/* Manual make/model/year fallback */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-lg">
              <Input
                placeholder="Marque"
                value={make}
                onChange={(e) => setMake(e.target.value.toUpperCase())}
              />
              <Input
                placeholder="Modèle"
                value={model}
                onChange={(e) => setModel(e.target.value.toUpperCase())}
              />
              <Input
                placeholder="Année"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                maxLength={4}
              />
            </div>
          </section>

          {/* ── Step 2: Part search (only after vehicle identified) ── */}
          {showPartSearch && (
            <section className="space-y-6 pt-2 border-t">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Recherchez votre
                produit
              </h2>
              {vehicle && (
                <p className="text-xs text-muted-foreground -mt-3">
                  Résultats filtrés pour{" "}
                  <strong className="text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </strong>
                </p>
              )}

              <div className="flex gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nom de la pièce (ex. filtre à huile, plaquettes de frein)"
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
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
