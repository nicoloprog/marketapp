import { NextResponse } from "next/server";

function localizeGoogleLink(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("google.com/shopping")) {
    return url.includes("?") ? `${url}&gl=ca` : `${url}?gl=ca`;
  }
  return url;
}

// Intelligently format a size + unit for construction search
function formatSize(size: string, sizeUnit: string): string {
  if (!size) return "";
  const trimmed = size.trim();

  // Dimension format like "4x8", "2x4x8", "4 x 8" — normalize spaces around x
  const isDimension = /\d+\s*x\s*\d+/i.test(trimmed);

  if (isDimension) {
    const normalized = trimmed.replace(/\s*x\s*/gi, "x");
    // If user picked a linear unit (po, cm, mm, pi, m), infer area unit
    const areaUnit =
      sizeUnit === "pi"
        ? "pi²"
        : sizeUnit === "m"
          ? "m²"
          : sizeUnit === "po"
            ? "po²"
            : sizeUnit === "cm"
              ? "cm²"
              : sizeUnit; // already an area/volume unit
    return `${normalized} ${areaUnit}`;
  }

  // Fraction or single value like "1/2", "3/4", "5/8"
  return `${trimmed} ${sizeUnit}`;
}

export async function POST(req: Request) {
  const { material, category, quantity, unit, size, sizeUnit } =
    await req.json();

  const formattedSize = formatSize(size ?? "", sizeUnit ?? "po");

  // Build query: category + material + size right after (high search weight) + quantity
  const queryParts = [
    category,
    material,
    formattedSize,
    quantity && unit ? `${quantity} ${unit}` : "",
  ].filter(Boolean);
  const q = queryParts.join(" ").trim();
  const apiKey = process.env.SERPAPI_API_KEY!;
  const enc = encodeURIComponent(q);

  const amazonUrl = `https://serpapi.com/search.json?engine=amazon&k=${enc}&amazon_domain=amazon.ca&api_key=${apiKey}`;
  const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${enc}&location=Montreal%2C+Quebec%2C+Canada&google_domain=google.ca&gl=ca&hl=fr&api_key=${apiKey}`;

  try {
    const [amazonRes, shoppingRes] = await Promise.all([
      fetch(amazonUrl),
      fetch(shoppingUrl),
    ]);

    const [amazonData, shoppingData] = await Promise.all([
      amazonRes.json(),
      shoppingRes.json(),
    ]);

    const amazon = (amazonData.organic_results || []).map((item: any) => ({
      partTerminologyName: item.title,
      brandLabel: item.brand || "Amazon",
      partNumber: item.asin || "N/A",
      description: item.title,
      price:
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
          : (item.price?.extracted_value ?? item.price ?? null),
      link: item.asin
        ? `https://www.amazon.ca/dp/${item.asin}`
        : item.link || null,
      thumbnail: item.thumbnail || item.image || null,
      source: "amazon" as const,
    }));

    const shopping = (shoppingData.shopping_results || []).map((item: any) => ({
      partTerminologyName: item.title,
      brandLabel: item.source || "Google Shopping",
      partNumber: item.product_id || "N/A",
      description: item.title,
      price: item.extracted_price ?? item.price ?? null,
      link: item.product_link || localizeGoogleLink(item.link),
      thumbnail: item.thumbnail || null,
      source: "shopping" as const,
    }));

    return NextResponse.json({ amazon, shopping, query: q });
  } catch (error) {
    console.error("SerpApi Error:", error);
    return NextResponse.json(
      { amazon: [], shopping: [], query: q },
      { status: 500 },
    );
  }
}
