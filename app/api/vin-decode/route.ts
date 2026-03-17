// app/api/vin-decode/route.ts
//
// Flow:  VIN → NHTSA decode → CarQuery enrich → DB cache → return
//
// ENV VARS needed:
//   DATABASE_URL   – PostgreSQL connection string

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// ── DB ──────────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Types ───────────────────────────────────────────────────────────────────
export interface VehicleData {
  vin: string;

  // NHTSA
  make: string;
  model: string;
  year: string;
  manufacturer: string;
  bodyClass: string;
  engineModel: string;
  fuelType: string;
  trim: string;

  // CarQuery enrichment
  cq?: {
    makeId: string;
    modelId: string;
    trimId: string;
    body: string;
    doors: string;
    cylinders: string;
    displacement: string; // cc
    horsepower: string;
    torque: string;
    fuel: string;
    drive: string;
    transmission: string;
    weight: string;
  };

  source: "cache" | "live";
}

// ── NHTSA ───────────────────────────────────────────────────────────────────
async function decodeWithNHTSA(
  vin: string,
): Promise<Record<string, string> | null> {
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${vin}?format=json`,
  );
  if (!res.ok) return null;

  const json = await res.json();
  const r = json?.Results?.[0];
  if (!r) return null;

  return {
    make: r.Make ?? "",
    model: r.Model ?? "",
    year: r.ModelYear ?? "",
    manufacturer: r.Manufacturer ?? "",
    bodyClass: r.BodyClass ?? "",
    engineModel: r.EngineModel ?? "",
    fuelType: r.FuelTypePrimary ?? "",
    trim: r.Trim ?? "",
  };
}

// ── CarQuery ────────────────────────────────────────────────────────────────
//  Public JSON-P API – we call it server-side so we avoid CORS completely.
const CQ_BASE = "https://www.carqueryapi.com/api/0.3/";

async function carQueryGetMake(make: string): Promise<string | null> {
  try {
    const res = await fetch(`${CQ_BASE}?cmd=getMakes&callback=_`);
    const text = await res.text();
    // Strip JSONP wrapper:  _({...})
    const json = JSON.parse(text.replace(/^_\(/, "").replace(/\);?$/, ""));
    const match = (json.Makes as any[]).find(
      (m: any) =>
        m.make_display?.toLowerCase() === make.toLowerCase() ||
        m.make_id?.toLowerCase() === make.toLowerCase(),
    );
    return match?.make_id ?? null;
  } catch {
    return null;
  }
}

async function carQueryGetTrims(
  makeId: string,
  model: string,
  year: string,
): Promise<any | null> {
  try {
    const url =
      `${CQ_BASE}?cmd=getTrims` +
      `&make=${encodeURIComponent(makeId)}` +
      `&model=${encodeURIComponent(model)}` +
      `&year=${encodeURIComponent(year)}` +
      `&callback=_`;

    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.replace(/^_\(/, "").replace(/\);?$/, ""));
    const trims: any[] = json.Trims ?? [];
    // Return the first trim (best match)
    return trims[0] ?? null;
  } catch {
    return null;
  }
}

function mapCQTrim(trim: any) {
  return {
    makeId: trim.make_id ?? "",
    modelId: trim.model_id ?? "",
    trimId: trim.model_trim_id ?? "",
    body: trim.model_body ?? "",
    doors: trim.model_doors ?? "",
    cylinders: trim.model_engine_cyl ?? "",
    displacement: trim.model_engine_cc ?? "",
    horsepower: trim.model_engine_power_ps ?? "",
    torque: trim.model_engine_torque_nm ?? "",
    fuel: trim.model_engine_fuel ?? "",
    drive: trim.model_drive ?? "",
    transmission: trim.model_transmission_type ?? "",
    weight: trim.model_weight_kg ?? "",
  };
}

// ── DB helpers ───────────────────────────────────────────────────────────────
async function getCachedVehicle(vin: string): Promise<VehicleData | null> {
  const { rows } = await pool.query(
    "SELECT * FROM vehicle_cache WHERE vin = $1",
    [vin.toUpperCase()],
  );
  if (!rows.length) return null;

  const r = rows[0];
  return {
    vin: r.vin,
    make: r.nhtsa_make,
    model: r.nhtsa_model,
    year: r.nhtsa_year,
    manufacturer: r.nhtsa_manufacturer,
    bodyClass: r.nhtsa_body_class,
    engineModel: r.nhtsa_engine_model,
    fuelType: r.nhtsa_fuel_type,
    trim: r.nhtsa_trim,
    cq: r.cq_raw
      ? {
          makeId: r.cq_make_id,
          modelId: r.cq_model_id,
          trimId: r.cq_trim_id,
          body: r.cq_body,
          doors: r.cq_doors,
          cylinders: r.cq_cylinders,
          displacement: r.cq_displacement,
          horsepower: r.cq_horsepower,
          torque: r.cq_torque,
          fuel: r.cq_fuel,
          drive: r.cq_drive,
          transmission: r.cq_transmission,
          weight: r.cq_weight,
        }
      : undefined,
    source: "cache",
  };
}

async function upsertVehicleCache(
  vin: string,
  nhtsa: Record<string, string>,
  nhtsaRaw: object,
  cq: ReturnType<typeof mapCQTrim> | null,
  cqRaw: object | null,
) {
  await pool.query(
    `INSERT INTO vehicle_cache (
        vin,
        nhtsa_make, nhtsa_model, nhtsa_year, nhtsa_manufacturer,
        nhtsa_body_class, nhtsa_engine_model, nhtsa_fuel_type, nhtsa_trim,
        nhtsa_raw,
        cq_make_id, cq_model_id, cq_trim_id, cq_body, cq_doors,
        cq_cylinders, cq_displacement, cq_horsepower, cq_torque,
        cq_fuel, cq_drive, cq_transmission, cq_weight, cq_raw
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
      )
      ON CONFLICT (vin) DO UPDATE SET
        nhtsa_make         = EXCLUDED.nhtsa_make,
        nhtsa_model        = EXCLUDED.nhtsa_model,
        nhtsa_year         = EXCLUDED.nhtsa_year,
        nhtsa_manufacturer = EXCLUDED.nhtsa_manufacturer,
        nhtsa_body_class   = EXCLUDED.nhtsa_body_class,
        nhtsa_engine_model = EXCLUDED.nhtsa_engine_model,
        nhtsa_fuel_type    = EXCLUDED.nhtsa_fuel_type,
        nhtsa_trim         = EXCLUDED.nhtsa_trim,
        nhtsa_raw          = EXCLUDED.nhtsa_raw,
        cq_make_id         = EXCLUDED.cq_make_id,
        cq_model_id        = EXCLUDED.cq_model_id,
        cq_trim_id         = EXCLUDED.cq_trim_id,
        cq_body            = EXCLUDED.cq_body,
        cq_doors           = EXCLUDED.cq_doors,
        cq_cylinders       = EXCLUDED.cq_cylinders,
        cq_displacement    = EXCLUDED.cq_displacement,
        cq_horsepower      = EXCLUDED.cq_horsepower,
        cq_torque          = EXCLUDED.cq_torque,
        cq_fuel            = EXCLUDED.cq_fuel,
        cq_drive           = EXCLUDED.cq_drive,
        cq_transmission    = EXCLUDED.cq_transmission,
        cq_weight          = EXCLUDED.cq_weight,
        cq_raw             = EXCLUDED.cq_raw,
        updated_at         = NOW()`,
    [
      vin.toUpperCase(),
      nhtsa.make,
      nhtsa.model,
      nhtsa.year,
      nhtsa.manufacturer,
      nhtsa.bodyClass,
      nhtsa.engineModel,
      nhtsa.fuelType,
      nhtsa.trim,
      JSON.stringify(nhtsaRaw),
      cq?.makeId ?? null,
      cq?.modelId ?? null,
      cq?.trimId ?? null,
      cq?.body ?? null,
      cq?.doors ?? null,
      cq?.cylinders ?? null,
      cq?.displacement ?? null,
      cq?.horsepower ?? null,
      cq?.torque ?? null,
      cq?.fuel ?? null,
      cq?.drive ?? null,
      cq?.transmission ?? null,
      cq?.weight ?? null,
      cqRaw ? JSON.stringify(cqRaw) : null,
    ],
  );
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get("vin")?.trim().toUpperCase();
  if (!vin || vin.length !== 17) {
    return NextResponse.json(
      { error: "VIN must be exactly 17 characters." },
      { status: 400 },
    );
  }

  // 1 — Try DB cache first
  const cached = await getCachedVehicle(vin);
  if (cached) return NextResponse.json(cached);

  // 2 — NHTSA decode
  const nhtsaRaw = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${vin}?format=json`,
  ).then((r) => r.json());
  const nhtsa = await decodeWithNHTSA(vin);
  if (!nhtsa || !nhtsa.make) {
    return NextResponse.json(
      { error: "NHTSA could not decode this VIN." },
      { status: 422 },
    );
  }

  // 3 — CarQuery enrich
  const makeId = await carQueryGetMake(nhtsa.make);
  let cqTrimRaw: any = null;
  let cqTrim: ReturnType<typeof mapCQTrim> | null = null;

  if (makeId && nhtsa.model && nhtsa.year) {
    cqTrimRaw = await carQueryGetTrims(makeId, nhtsa.model, nhtsa.year);
    if (cqTrimRaw) cqTrim = mapCQTrim(cqTrimRaw);
  }

  // 4 — Persist to DB
  await upsertVehicleCache(vin, nhtsa, nhtsaRaw, cqTrim, cqTrimRaw);

  const result: VehicleData = {
    vin,
    ...nhtsa,
    cq: cqTrim ?? undefined,
    source: "live",
    make: "",
    model: "",
    year: "",
    manufacturer: "",
    bodyClass: "",
    engineModel: "",
    fuelType: "",
    trim: "",
  };

  return NextResponse.json(result);
}
