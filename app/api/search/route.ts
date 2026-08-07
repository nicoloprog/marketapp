import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { searchScrapingdogProducts } from "@/lib/api/scrapingdog";
import { getSearchRegionFromRequest } from "@/lib/api/search-region";
import { enforceSubscriptionSearchLimit } from "@/lib/api/subscription-limits";

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "search", 4, 60_000);
  if (rateLimited) return rateLimited;

  const subscriptionLimited = await enforceSubscriptionSearchLimit("vehicle");
  if (subscriptionLimited) return subscriptionLimited;

  const { year, make, model, partName } = await req.json();
  const q = `${make} ${model} ${year} ${partName}`;

  try {
    const { amazon, shopping } = await searchScrapingdogProducts(q, {
      region: getSearchRegionFromRequest(req),
    });
    return NextResponse.json({ amazon, shopping });
  } catch (error) {
    console.error("Scrapingdog Error:", error);
    return NextResponse.json({ amazon: [], shopping: [] }, { status: 500 });
  }
}
