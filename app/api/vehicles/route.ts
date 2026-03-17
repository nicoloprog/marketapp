import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vin = searchParams.get("vin");

  if (!vin)
    return NextResponse.json({ error: "VIN required" }, { status: 400 });

  // Optionally, decode VIN via NHTSA
  const decodeRes = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
  );
  const data = await decodeRes.json();
  const result = data.Results[0];

  if (!result)
    return NextResponse.json({ error: "Invalid VIN" }, { status: 400 });

  // Match your vehicles table
  const { data: vehiclesData } = await supabase
    .from("vehicles")
    .select("*")
    .eq("make", result.Make)
    .eq("model", result.Model)
    .eq("year", Number(result.ModelYear));

  if (!vehiclesData || vehiclesData.length === 0) {
    return NextResponse.json(
      { error: "Vehicle not found in database" },
      { status: 404 },
    );
  }

  return NextResponse.json(vehiclesData[0]);
}
