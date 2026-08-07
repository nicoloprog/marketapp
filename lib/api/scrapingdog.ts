import { getSearchRegion } from "@/lib/api/search-region";
import type { SearchRegion } from "@/lib/api/search-region";
import { parsePrice } from "@/lib/price";

const AMAZON_SEARCH_URL = "https://api.scrapingdog.com/amazon/search";
const GOOGLE_SHOPPING_URL = "https://api.scrapingdog.com/google_shopping";

export type ProductSearchItem = {
  partTerminologyName: string;
  brandLabel: string;
  partNumber: string;
  description: string;
  price: number | null;
  link: string | null;
  thumbnail: string | null;
  source: "amazon" | "shopping";
};

type ProductSearchOptions = {
  pricedOnly?: boolean;
  region?: SearchRegion;
};

type RawItem = Record<string, unknown>;

function getApiKey(): string {
  const apiKey =
    process.env.SCRAPINGDOG_API_KEY || process.env.SCRAPING_DOG_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SCRAPINGDOG_API_KEY");
  }

  return apiKey;
}

function isObject(value: unknown): value is RawItem {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getStringId(value: unknown): string | null {
  if (typeof value === "number") return String(value);
  return getString(value);
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    return parsePrice(value);
  }

  if (isObject(value)) {
    return getNumber(value.extracted_value ?? value.extracted_price);
  }

  return null;
}

function buildUrl(baseUrl: string, params: Record<string, string>): string {
  return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}

function getLocationParts(region: SearchRegion): string[] {
  return [region.city, region.subdivision?.label, region.label].filter(
    (part): part is string => Boolean(part),
  );
}

function getShoppingQuery(query: string, region: SearchRegion): string {
  const locationParts = getLocationParts(region);

  if (!region.city && !region.subdivision) return query;

  return `${query} ${locationParts.join(" ")}`;
}

function getShoppingParams(
  query: string,
  apiKey: string,
  region: SearchRegion,
): Record<string, string> {
  const params: Record<string, string> = {
    api_key: apiKey,
    query: getShoppingQuery(query, region),
    country: region.country,
    domain: region.googleDomain,
    language: region.googleLanguage,
    gl: region.country,
    hl: region.googleLanguage,
  };

  const locationParts = getLocationParts(region);

  if (locationParts.length > 1) {
    params.location = locationParts.join(", ");
  }

  return params;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Scrapingdog request failed (${res.status}): ${body}`);
  }

  return res.json();
}

function getAmazonItems(data: unknown): RawItem[] {
  if (!isObject(data)) return [];

  if (Array.isArray(data.results)) {
    return data.results.filter(isObject);
  }

  const firstItem = (data as Record<string, unknown>)[0];
  if (Array.isArray(firstItem)) {
    return firstItem.filter(isObject);
  }

  return [];
}

function getShoppingItems(data: unknown): RawItem[] {
  if (!isObject(data) || !Array.isArray(data.shopping_results)) return [];
  return data.shopping_results.filter(isObject);
}

function getAmazonHost(region: SearchRegion): string {
  return `www.amazon.${region.amazonDomain}`;
}

function localizeGoogleLink(
  url: string | null,
  region: SearchRegion,
): string | null {
  if (!url) return null;

  if (url.startsWith("//")) {
    return localizeGoogleLink(`https:${url}`, region);
  }

  if (url.startsWith("/")) {
    return localizeGoogleLink(`https://www.${region.googleDomain}${url}`, region);
  }

  if (/google\.[^/]+\/shopping/.test(url)) {
    return url.includes("?")
      ? `${url}&gl=${region.country}`
      : `${url}?gl=${region.country}`;
  }

  return url;
}

function getGoogleShoppingLink(
  item: RawItem,
  region: SearchRegion,
): string | null {
  return (
    localizeGoogleLink(getString(item.product_link), region) ||
    localizeGoogleLink(getString(item.product_url), region) ||
    localizeGoogleLink(getString(item.merchant_link), region) ||
    localizeGoogleLink(getString(item.redirect_link), region) ||
    localizeGoogleLink(getString(item.link), region) ||
    localizeGoogleLink(getString(item.url), region) ||
    localizeGoogleLink(getString(item.shopping_link), region)
  );
}

function normalizeAmazonItem(
  item: RawItem,
  region: SearchRegion,
): ProductSearchItem | null {
  const title = getString(item.title);
  if (!title) return null;

  const asin = getString(item.asin);

  return {
    partTerminologyName: title,
    brandLabel: getString(item.brand) || "Amazon",
    partNumber: asin || "N/A",
    description: title,
    price: getNumber(item.price ?? item.price_string ?? item.extracted_price),
    link: asin
      ? `https://${getAmazonHost(region)}/dp/${asin}`
      : getString(item.optimized_url) ||
        getString(item.url) ||
        getString(item.link),
    thumbnail: getString(item.thumbnail) || getString(item.image),
    source: "amazon",
  };
}

function normalizeShoppingItem(
  item: RawItem,
  region: SearchRegion,
): ProductSearchItem | null {
  const title = getString(item.title);
  if (!title) return null;

  const productId = getStringId(item.product_id);

  return {
    partTerminologyName: title,
    brandLabel: getString(item.source) || "Google Shopping",
    partNumber: productId || "N/A",
    description: title,
    price: getNumber(item.price ?? item.extracted_price),
    link: getGoogleShoppingLink(item, region),
    thumbnail: getString(item.thumbnail),
    source: "shopping",
  };
}

function normalizeItems<T extends RawItem>(
  items: T[],
  normalizeItem: (item: T) => ProductSearchItem | null,
  options: ProductSearchOptions,
): ProductSearchItem[] {
  return items
    .map(normalizeItem)
    .filter((item): item is ProductSearchItem => {
      if (!item) return false;
      if (!options.pricedOnly) return true;
      return item.price !== null && item.price > 1;
    });
}

export async function searchScrapingdogProducts(
  query: string,
  options: ProductSearchOptions = {},
): Promise<{ amazon: ProductSearchItem[]; shopping: ProductSearchItem[] }> {
  const apiKey = getApiKey();
  const region = options.region ?? getSearchRegion();
  const amazonUrl = buildUrl(AMAZON_SEARCH_URL, {
    api_key: apiKey,
    domain: region.amazonDomain,
    query,
    page: "1",
    country: region.country,
  });
  const shoppingUrl = buildUrl(
    GOOGLE_SHOPPING_URL,
    getShoppingParams(query, apiKey, region),
  );

  const [amazonData, shoppingData] = await Promise.all([
    fetchJson(amazonUrl),
    fetchJson(shoppingUrl),
  ]);

  return {
    amazon: normalizeItems(
      getAmazonItems(amazonData),
      (item) => normalizeAmazonItem(item, region),
      options,
    ),
    shopping: normalizeItems(
      getShoppingItems(shoppingData),
      (item) => normalizeShoppingItem(item, region),
      options,
    ),
  };
}
