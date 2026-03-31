import { NextResponse } from "next/server";

// Force Canadian localization on any leftover Google Shopping URLs
function localizeGoogleLink(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("google.com/shopping")) {
    return url.includes("?") ? `${url}&gl=ca` : `${url}?gl=ca`;
  }
  return url;
}

// convert ANY price to number
function getPrice(value: any): number | null {
  if (!value) return null;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const p = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(p) ? null : p;
  }

  if (value?.extracted_value) return value.extracted_value;

  return null;
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

    const amazon = (amazonData.organic_results || [])
      .map((item: any) => {
        const price = getPrice(item.price);

        return {
          partTerminologyName: item.title,
          brandLabel: item.brand || "Amazon",
          partNumber: item.asin || "N/A",
          description: item.title,
          price,
          link: item.asin
            ? `https://www.amazon.ca/dp/${item.asin}`
            : item.link || null,
          thumbnail: item.thumbnail || item.image || null,
          source: "amazon" as const,
        };
      })
      .filter((item: any) => item.price !== null && item.price > 1);

    const shopping = (shoppingData.shopping_results || [])
      .map((item: any) => {
        const price = getPrice(item.extracted_price ?? item.price);

        return {
          partTerminologyName: item.title,
          brandLabel: item.source || "Google Shopping",
          partNumber: item.product_id || "N/A",
          description: item.title,
          price,
          link: item.product_link || localizeGoogleLink(item.link),
          thumbnail: item.thumbnail || null,
          source: "shopping" as const,
        };
      })
      .filter((item: any) => item.price !== null && item.price > 1);

    return NextResponse.json({ amazon, shopping });
  } catch (error) {
    console.error("SerpApi Error:", error);
    return NextResponse.json({ amazon: [], shopping: [] }, { status: 500 });
  }
}
