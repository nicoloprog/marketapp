export function parsePrice(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const normalized = value.replace(/\s/g, "").replace(/[^0-9.,]/g, "");
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    return parseNormalizedNumber(
      normalized
        .replaceAll(thousandsSeparator, "")
        .replace(decimalSeparator, "."),
    );
  }

  if (lastComma >= 0) {
    return parseSingleSeparatorNumber(normalized, ",");
  }

  if (lastDot >= 0) {
    return parseSingleSeparatorNumber(normalized, ".");
  }

  return parseNormalizedNumber(normalized);
}

function parseSingleSeparatorNumber(value: string, separator: "," | ".") {
  const parts = value.split(separator);
  const lastPart = parts.at(-1) ?? "";

  if (parts.length > 2 || lastPart.length === 3) {
    return parseNormalizedNumber(parts.join(""));
  }

  return parseNormalizedNumber(value.replace(separator, "."));
}

function parseNormalizedNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
