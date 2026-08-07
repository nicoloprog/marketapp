import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { searchScrapingdogProducts } from "@/lib/api/scrapingdog";
import { getSearchRegionFromRequest } from "@/lib/api/search-region";
import { enforceSubscriptionSearchLimit } from "@/lib/api/subscription-limits";

// Intelligently format a size + unit for construction search
function formatSize(size: string, sizeUnit: string): string {
  if (!size) return "";
  const trimmed = size.trim();

  // Dimension format like "4x8", "2x4x8", "4 x 8" - normalize spaces around x
  const isDimension = /\d+\s*x\s*\d+/i.test(trimmed);

  if (isDimension) {
    const normalized = trimmed.replace(/\s*x\s*/gi, "x");
    // If user picked a linear unit (po, cm, mm, pi, m), infer area unit
    const areaUnit =
      sizeUnit === "pi"
        ? "pi2"
        : sizeUnit === "m"
          ? "m2"
          : sizeUnit === "po"
            ? "po2"
            : sizeUnit === "cm"
              ? "cm2"
              : sizeUnit; // already an area/volume unit
    return `${normalized} ${areaUnit}`;
  }

  // Fraction or single value like "1/2", "3/4", "5/8"
  return `${trimmed} ${sizeUnit}`;
}

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, "searchmaterial", 4, 60_000);
  if (rateLimited) return rateLimited;

  const subscriptionLimited = await enforceSubscriptionSearchLimit("material");
  if (subscriptionLimited) return subscriptionLimited;

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

  try {
    const { amazon, shopping } = await searchScrapingdogProducts(q, {
      region: getSearchRegionFromRequest(req),
    });
    return NextResponse.json({ amazon, shopping, query: q });
  } catch (error) {
    console.error("Scrapingdog Error:", error);
    return NextResponse.json(
      { amazon: [], shopping: [], query: q },
      { status: 500 },
    );
  }
}
