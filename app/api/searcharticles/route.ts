import { NextResponse } from "next/server";

function extractPrice(snippet: string): number | null {
  const match = (snippet || "").match(/\$[\d,]+(\.\d{1,2})?/);
  return match ? parseFloat(match[0].replace(/[$,]/g, "")) : null;
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

  const apiKey = process.env.SERPAPI_API_KEY;
  const enc = encodeURIComponent(q);

  const urls = {
    amazon: `https://serpapi.com/search.json?engine=amazon&k=${enc}&amazon_domain=amazon.com&api_key=${apiKey}`,
    walmart: `https://serpapi.com/search.json?engine=walmart&query=${enc}&api_key=${apiKey}`,
    rockauto: `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:rockauto.com ${q}`)}&api_key=${apiKey}`,
    homedepot: `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:homedepot.com ${q}`)}&api_key=${apiKey}`,
    bestbuy: `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:bestbuy.com ${q}`)}&api_key=${apiKey}`,
    target: `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:target.com ${q}`)}&api_key=${apiKey}`,
  };

  try {
    const responses = await Promise.all(
      Object.values(urls).map((u) => fetch(u)),
    );
    const [
      amazonData,
      walmartData,
      rockAutoData,
      homedepotData,
      bestbuyData,
      targetData,
    ] = await Promise.all(responses.map((r) => r.json()));

    const amazon = (amazonData.organic_results || []).map((item: any) => ({
      partTerminologyName: item.title,
      brandLabel: item.brand || "Amazon",
      partNumber: item.asin || "N/A",
      description: item.title,
      price: item.price?.raw || item.price || null,
      link:
        item.link ||
        (item.asin ? `https://www.amazon.com/dp/${item.asin}` : null),
      thumbnail: item.thumbnail || item.image || null,
      source: "amazon" as const,
    }));

    const walmart = (walmartData.organic_results || []).map((item: any) => ({
      partTerminologyName: item.title,
      brandLabel: item.seller_name || "Walmart",
      partNumber: item.us_item_id || item.item_id || "N/A",
      description: item.title,
      price: item.primary_offer?.offer_price ?? item.price ?? null,
      link:
        item.product_page_url ||
        (item.us_item_id
          ? `https://www.walmart.com/ip/${item.us_item_id}`
          : null),
      thumbnail: item.thumbnail || null,
      source: "walmart" as const,
    }));

    const mapGoogleSite = (data: any, brand: string, source: string) =>
      (data.organic_results || []).map((item: any) => ({
        partTerminologyName: item.title
          ?.replace(/\s*[-|]\s*(RockAuto|Home Depot|Best Buy|Target).*$/i, "")
          .trim(),
        brandLabel: brand,
        partNumber: "N/A",
        description: item.snippet || "",
        price: extractPrice(item.snippet),
        link: item.link || null,
        thumbnail: item.thumbnail || null,
        source,
      }));

    return NextResponse.json({
      amazon,
      walmart,
      rockauto: mapGoogleSite(rockAutoData, "RockAuto", "rockauto"),
      homedepot: mapGoogleSite(homedepotData, "Home Depot", "homedepot"),
      bestbuy: mapGoogleSite(bestbuyData, "Best Buy", "bestbuy"),
      target: mapGoogleSite(targetData, "Target", "target"),
    });
  } catch (error) {
    console.error("SerpApi Error:", error);
    return NextResponse.json(
      {
        amazon: [],
        walmart: [],
        rockauto: [],
        homedepot: [],
        bestbuy: [],
        target: [],
      },
      { status: 500 },
    );
  }
}
