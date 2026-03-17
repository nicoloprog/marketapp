import { NextResponse } from "next/server";

function extractPrice(snippet: string): number | null {
  const match = (snippet || "").match(/\$[\d,]+(\.\d{1,2})?/);
  return match ? parseFloat(match[0].replace(/[$,]/g, "")) : null;
}

export async function POST(req: Request) {
  const { year, make, model, partName } = await req.json();
  const query = `${make} ${model} ${year} ${partName}`;
  const apiKey = process.env.SERPAPI_API_KEY;
  const enc = encodeURIComponent(query);

  const amazonUrl = `https://serpapi.com/search.json?engine=amazon&k=${enc}&amazon_domain=amazon.com&api_key=${apiKey}`;
  const walmartUrl = `https://serpapi.com/search.json?engine=walmart&query=${enc}&api_key=${apiKey}`;
  const rockAutoUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:rockauto.com ${query}`)}&api_key=${apiKey}`;
  const partCityUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`site:partcity.com ${query}`)}&api_key=${apiKey}`;

  try {
    const [amazonRes, walmartRes, rockAutoRes, partCityRes] = await Promise.all(
      [
        fetch(amazonUrl),
        fetch(walmartUrl),
        fetch(rockAutoUrl),
        fetch(partCityUrl),
      ],
    );

    const [amazonData, walmartData, rockAutoData, partCityData] =
      await Promise.all([
        amazonRes.json(),
        walmartRes.json(),
        rockAutoRes.json(),
        partCityRes.json(),
      ]);

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
      source: "amazon",
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
      source: "walmart",
    }));

    const mapGoogleSite = (data: any, brand: string, source: string) =>
      (data.organic_results || []).map((item: any) => ({
        partTerminologyName: item.title
          ?.replace(/\s*[-|]\s*(RockAuto|Part City).*$/i, "")
          .trim(),
        brandLabel: brand,
        partNumber: "N/A",
        description: item.snippet || "",
        price: extractPrice(item.snippet),
        link: item.link || null,
        thumbnail: item.thumbnail || null,
        source,
      }));

    const rockauto = mapGoogleSite(rockAutoData, "RockAuto", "rockauto");
    const partcity = mapGoogleSite(partCityData, "Part City", "partcity");

    return NextResponse.json({ amazon, walmart, rockauto, partcity });
  } catch (error) {
    console.error("SerpApi Error:", error);
    return NextResponse.json(
      { amazon: [], walmart: [], rockauto: [], partcity: [] },
      { status: 500 },
    );
  }
}
