import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "vehicle-parts", 4, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const { searchParams } = new URL(req.url);

    const make = searchParams.get("make")?.trim();
    const model = searchParams.get("model")?.trim();
    const yearStr = searchParams.get("year")?.trim();
    const manufacturer = searchParams.get("manufacturer")?.trim() || make;
    const year = yearStr ? parseInt(yearStr, 10) : undefined;

    if (!make || !model || !year) {
      return NextResponse.json(
        { error: "Missing vehicle parameters (make, model, year)" },
        { status: 400 },
      );
    }

    const { data: compatibleProducts, error: dbError } = await supabase
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
      .ilike("vehicles.make", make)
      .ilike("vehicles.model", model)
      .eq("vehicles.year", year);

    if (dbError) {
      console.error("Vehicle parts query failed:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const storeProducts =
      compatibleProducts?.map((item: any) => item.products) ?? [];

    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/GetParts?type=565&fromDate=1/1/2015&toDate=5/5/2015&format=json&page=1&manufacturer=${encodeURIComponent(
      manufacturer || "",
    )}`;

    let nhtsaParts: any[] = [];
    try {
      const partsRes = await fetch(nhtsaUrl, { cache: "no-store" });
      const partsData = await partsRes.json();
      nhtsaParts = partsData.Results || [];
    } catch (err) {
      console.error("Failed to fetch NHTSA parts:", err);
    }

    return NextResponse.json({
      vehicle: { make, model, year, manufacturer },
      storeInventory: storeProducts,
      nhtsaDocumentation: nhtsaParts,
    });
  } catch (err) {
    console.error("Unexpected vehicle-parts API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
