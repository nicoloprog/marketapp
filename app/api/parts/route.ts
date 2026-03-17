import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// ── DB Connection ────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Helper: Free NHTSA Vehicle Validator ─────────────────────────────────────
async function validateVehicle(make: string, model: string, year: string) {
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`;
    const res = await fetch(url);
    const data = await res.json();

    // Check if the model exists in the returned list
    return data.Results.some(
      (m: any) => m.Model_Name.toLowerCase() === model.toLowerCase(),
    );
  } catch {
    return false;
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const make = sp.get("make")?.trim() ?? "";
  const model = sp.get("model")?.trim() ?? "";
  const year = sp.get("year")?.trim() ?? "";

  if (!make || !model || !year) {
    return NextResponse.json(
      { error: "Make, model, and year required." },
      { status: 400 },
    );
  }

  // 1. Validate vehicle existence using free government data
  const isValid = await validateVehicle(make, model, year);
  if (!isValid) {
    return NextResponse.json(
      { error: "Vehicle not recognized." },
      { status: 404 },
    );
  }

  // 2. Query your local Database for parts
  try {
    const query = `
      SELECT * FROM parts 
      WHERE make ILIKE $1 AND model ILIKE $2 AND year = $3
    `;
    const { rows } = await pool.query(query, [make, model, parseInt(year)]);

    return NextResponse.json({
      vehicle: { make, model, year },
      parts: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
