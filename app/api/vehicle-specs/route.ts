import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${vin}?format=json`,
    );
    const data = await res.json();

    // NHTSA returns an array; index 0 is the primary vehicle match
    const vehicle = data.Results[0];

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("NHTSA Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technical specs" },
      { status: 500 },
    );
  }
}
