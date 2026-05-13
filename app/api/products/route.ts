import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  images: string[] | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: string | number | null;
};

function dedupeProducts(products: ProductRow[]) {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "products", 4, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const make = searchParams.get("make")?.trim();
  const model = searchParams.get("model")?.trim();
  const year = searchParams.get("year")?.trim();

  const applyBaseFilters = (query: any) => {
    let nextQuery = query.select("*");

    if (category) nextQuery = nextQuery.eq("category", category);
    if (make) nextQuery = nextQuery.eq("vehicle_make", make);
    if (model) nextQuery = nextQuery.eq("vehicle_model", model);
    if (year) nextQuery = nextQuery.eq("vehicle_year", year);

    return nextQuery;
  };

  try {
    if (!search) {
      const { data, error } = await applyBaseFilters(
        supabase.from("products"),
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data ?? []);
    }

    const searchPattern = `%${search}%`;
    const [nameResult, descriptionResult] = await Promise.all([
      applyBaseFilters(supabase.from("products"))
        .ilike("name", searchPattern)
        .limit(50),
      applyBaseFilters(supabase.from("products"))
        .ilike("description", searchPattern)
        .limit(50),
    ]);

    if (nameResult.error) {
      return NextResponse.json(
        { error: nameResult.error.message },
        { status: 500 },
      );
    }

    if (descriptionResult.error) {
      return NextResponse.json(
        { error: descriptionResult.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      dedupeProducts([
        ...((nameResult.data ?? []) as ProductRow[]),
        ...((descriptionResult.data ?? []) as ProductRow[]),
      ]),
    );
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
