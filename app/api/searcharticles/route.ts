import { NextResponse } from "next/server";

// Force Canadian localization on any leftover Google Shopping URLs
function localizeGoogleLink(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("google.com/shopping")) {
    return url.includes("?") ? `${url}&gl=ca` : `${url}?gl=ca`;
  }
  return url;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing query param: q" },
      { status: 400 },
    );
  }

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
      // Always prefer amazon.ca direct link
      link: item.asin
        ? `https://www.amazon.ca/dp/${item.asin}`
        : item.link || null,
      thumbnail: item.thumbnail || item.image || null,
      source: "amazon" as const,
    }));

    const shopping = (shoppingData.shopping_results || []).map((item: any) => ({
      partTerminologyName: item.title,
      // source = the actual retailer name (e.g. "Best Buy", "Walmart")
      brandLabel: item.source || "Google Shopping",
      partNumber: item.product_id || "N/A",
      description: item.title,
      price: item.extracted_price ?? item.price ?? null,
      // product_link is the direct retailer URL — prefer it over Google's redirect link
      link: item.product_link || localizeGoogleLink(item.link),
      thumbnail: item.thumbnail || null,
      source: "shopping" as const,
    }));

    return NextResponse.json({ amazon, shopping });
  } catch (error) {
    console.error("SerpApi Error:", error);
    return NextResponse.json({ amazon: [], shopping: [] }, { status: 500 });
  }
}
