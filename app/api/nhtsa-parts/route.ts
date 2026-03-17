import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const vin = searchParams.get("vin");
  let make = searchParams.get("make");
  let model = searchParams.get("model");
  let year = searchParams.get("year");

  try {
    // ===============================
    // 1️⃣ If VIN provided → Decode
    // ===============================
    if (vin) {
      const decodeRes = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
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

    // Normalize casing
    const normalizedMake = make.toUpperCase();
    const normalizedModel = model.toUpperCase();

    // ===============================
    // 2️⃣ Query Your DB (case insensitive)
    // ===============================
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

    if (error) throw error;

    const storeProducts = dbData?.map((item) => item.products) ?? [];

    // ===============================
    // 3️⃣ Call NHTSA GetParts (proper manufacturer param)
    // ===============================
    const params = new URLSearchParams({
      type: "565",
      fromDate: "1/1/2015",
      toDate: "12/31/2025",
      format: "json",
      page: "1",
      manufacturer: normalizedMake,
    });

    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/GetParts?type=565&fromDate=1/1/2015&toDate=5/5/2025&format=xml&page=1&manufacturer=${params.toString()}`;

    const partsRes = await fetch(nhtsaUrl);

    let nhtsaParts: any[] = [];

    if (partsRes.ok) {
      const partsData = await partsRes.json();
      nhtsaParts = partsData.Results ?? [];
    }

    // ===============================
    // 4️⃣ Return Unified Response
    // ===============================
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
