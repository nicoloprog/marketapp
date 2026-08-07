import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin")?.trim().toUpperCase();

  if (!vin || vin.length !== 17) {
    return NextResponse.json(
      { error: "VIN must be exactly 17 characters" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${vin}?format=json`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "NHTSA lookup failed" },
        { status: 502 },
      );
    }

    const data = await res.json();

    // NHTSA returns an array; index 0 is the primary vehicle match
    const vehicle = data.Results?.[0];
    if (!vehicle?.Make || !vehicle?.Model || !vehicle?.ModelYear) {
      return NextResponse.json(
        { error: "Vehicle not recognized" },
        { status: 404 },
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("NHTSA Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technical specs" },
      { status: 500 },
    );
  }
}
