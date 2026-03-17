import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vin = searchParams.get("vin");

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      { cache: "no-store" },
    );

    const data = await response.json();
    const results = data.Results;

    const getValue = (variable: string) =>
      results.find((r: any) => r.Variable === variable)?.Value;

    const vehicle = {
      make: getValue("Make"),
      model: getValue("Model"),
      year: getValue("Model Year"),
    };

    if (!vehicle.make || !vehicle.model || !vehicle.year) {
      return NextResponse.json(
        { error: "Unable to decode VIN" },
        { status: 400 },
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: "VIN decode failed" }, { status: 500 });
  }
}
