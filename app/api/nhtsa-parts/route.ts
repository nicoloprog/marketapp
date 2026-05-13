import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "nhtsa-parts", 4, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);

  const vin = searchParams.get("vin");
  let make = searchParams.get("make");
  let model = searchParams.get("model");
  let year = searchParams.get("year");

  try {
    if (vin) {
      const decodeRes = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
        { cache: "no-store" },
      );

      if (!decodeRes.ok) {
        return NextResponse.json(
          { error: "VIN decode failed" },
          { status: 500 },
        );
      }

      const decodeData = await decodeRes.json();
      const vehicle = decodeData.Results?.[0];

      make = vehicle?.Make;
      model = vehicle?.Model;
      year = vehicle?.ModelYear;
    }

    if (!make || !model || !year) {
      return NextResponse.json(
        { error: "Missing vehicle information" },
        { status: 400 },
      );
    }

    const normalizedMake = make.toUpperCase();
    const normalizedModel = model.toUpperCase();

    const { data: dbData, error } = await supabase
      .from("product_compatibility")
      .select(
        `
        products (
          id,
          name,
          description,
          price,
          stock,
          category,
          images
        ),
        vehicles!inner (
          make,
          model,
          year
        )
      `,
      )
      .ilike("vehicles.make", normalizedMake)
      .ilike("vehicles.model", normalizedModel)
      .eq("vehicles.year", year);

    if (error) {
      console.error("NHTSA parts query failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const storeProducts = dbData?.map((item: any) => item.products) ?? [];

    const partsParams = new URLSearchParams({
      type: "565",
      fromDate: "1/1/2015",
      toDate: "5/5/2025",
      format: "json",
      page: "1",
      manufacturer: normalizedMake,
    });

    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/GetParts?${partsParams.toString()}`;
    const partsRes = await fetch(nhtsaUrl, { cache: "no-store" });

    let nhtsaParts: any[] = [];
    if (partsRes.ok) {
      const partsData = await partsRes.json();
      nhtsaParts = partsData.Results ?? [];
    }

    return NextResponse.json({
      vehicle: { make: normalizedMake, model: normalizedModel, year },
      storeInventory: storeProducts,
      nhtsaDocumentation: nhtsaParts,
    });
  } catch (err) {
    console.error("Vehicle Parts API Error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
