import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { searchScrapingdogProducts } from "@/lib/api/scrapingdog";
import { getSearchRegionFromRequest } from "@/lib/api/search-region";
import { enforceSubscriptionSearchLimit } from "@/lib/api/subscription-limits";

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "searcharticles", 4, 60_000);
  if (rateLimited) return rateLimited;

  const subscriptionLimited = await enforceSubscriptionSearchLimit("article");
  if (subscriptionLimited) return subscriptionLimited;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing query param: q" },
      { status: 400 },
    );
  }

  try {
    const { amazon, shopping } = await searchScrapingdogProducts(q, {
      region: getSearchRegionFromRequest(req),
      pricedOnly: true,
    });
    return NextResponse.json({ amazon, shopping });
  } catch (error) {
    console.error("Scrapingdog Error:", error);
    return NextResponse.json({ amazon: [], shopping: [] }, { status: 500 });
  }
}
