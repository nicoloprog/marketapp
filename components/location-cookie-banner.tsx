"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, LocateFixed, MapPin, SlidersHorizontal, X } from "lucide-react";

import {
  CITY_COOKIE,
  COOKIE_CONSENT_COOKIE,
  COUNTRY_COOKIE,
  LOCATION_SOURCE_COOKIE,
  REGION_COOKIE,
  SUBDIVISION_COOKIE,
  getSearchSubdivisions,
  isCountryLevelOnlyRegion,
} from "@/lib/api/search-region";
import type { SearchCountryCode } from "@/lib/api/search-region";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const COOKIE_CONSENT_VERSION = "2026-08-location-v1";
const COOKIE_CONSENT_VERSION_COOKIE = "bp_cookie_consent_version";
const COOKIE_CONSENT_UPDATED_AT_COOKIE = "bp_cookie_consent_updated_at";
const LOCATION_UPDATED_AT_COOKIE = "bp_location_updated_at";
const LOCATION_PRECISION_COOKIE = "bp_location_precision";

const OPTIONAL_LOCATION_COOKIES = [
  COUNTRY_COOKIE,
  REGION_COOKIE,
  SUBDIVISION_COOKIE,
  CITY_COOKIE,
  LOCATION_SOURCE_COOKIE,
  LOCATION_UPDATED_AT_COOKIE,
  LOCATION_PRECISION_COOKIE,
];

type LocationAreaCode = "CA" | "US" | "EU" | "SA";

const COUNTRIES: { code: SearchCountryCode; label: string }[] = [
  { code: "CA", label: "Canada" },
  { code: "US", label: "United States" },
  { code: "AR", label: "Argentina" },
  { code: "BO", label: "Bolivia" },
  { code: "BR", label: "Brazil" },
  { code: "CL", label: "Chile" },
  { code: "CO", label: "Colombia" },
  { code: "EC", label: "Ecuador" },
  { code: "FR", label: "France" },
  { code: "GB", label: "United Kingdom" },
  { code: "GY", label: "Guyana" },
  { code: "PY", label: "Paraguay" },
  { code: "PE", label: "Peru" },
  { code: "SR", label: "Suriname" },
  { code: "UY", label: "Uruguay" },
  { code: "VE", label: "Venezuela" },
];

const LOCATION_AREAS: {
  code: LocationAreaCode;
  label: string;
  countries: SearchCountryCode[];
}[] = [
  { code: "CA", label: "Canada", countries: ["CA"] },
  { code: "US", label: "USA", countries: ["US"] },
  { code: "EU", label: "EU", countries: ["FR", "GB"] },
  {
    code: "SA",
    label: "SA",
    countries: [
      "AR",
      "BO",
      "BR",
      "CL",
      "CO",
      "EC",
      "GY",
      "PY",
      "PE",
      "SR",
      "UY",
      "VE",
    ],
  },
];

function getAreaForCountry(country: SearchCountryCode): LocationAreaCode {
  return (
    LOCATION_AREAS.find((area) => area.countries.includes(country))?.code ??
    "CA"
  );
}

function getCountriesForArea(areaCode: LocationAreaCode) {
  return (
    LOCATION_AREAS.find((area) => area.code === areaCode)?.countries ?? ["CA"]
  );
}

function getCountryLabel(countryCode: SearchCountryCode): string {
  return COUNTRIES.find((item) => item.code === countryCode)?.label ?? "Canada";
}

const TIMEZONE_DEFAULTS: Record<
  string,
  { country: SearchCountryCode; subdivision?: string }
> = {
  "America/Toronto": { country: "CA", subdivision: "ON" },
  "America/Montreal": { country: "CA", subdivision: "QC" },
  "America/Vancouver": { country: "CA", subdivision: "BC" },
  "America/Edmonton": { country: "CA", subdivision: "AB" },
  "America/Winnipeg": { country: "CA", subdivision: "MB" },
  "America/Halifax": { country: "CA", subdivision: "NS" },
  "America/New_York": { country: "US", subdivision: "NY" },
  "America/Chicago": { country: "US", subdivision: "IL" },
  "America/Los_Angeles": { country: "US", subdivision: "CA" },
  "America/Denver": { country: "US", subdivision: "CO" },
  "America/Argentina/Buenos_Aires": { country: "AR", subdivision: "C" },
  "America/Argentina/Catamarca": { country: "AR", subdivision: "K" },
  "America/Argentina/Cordoba": { country: "AR", subdivision: "X" },
  "America/Argentina/Jujuy": { country: "AR", subdivision: "Y" },
  "America/Argentina/La_Rioja": { country: "AR", subdivision: "F" },
  "America/Argentina/Mendoza": { country: "AR", subdivision: "M" },
  "America/Argentina/Rio_Gallegos": { country: "AR", subdivision: "Z" },
  "America/Argentina/Salta": { country: "AR", subdivision: "A" },
  "America/Argentina/San_Juan": { country: "AR", subdivision: "J" },
  "America/Argentina/San_Luis": { country: "AR", subdivision: "D" },
  "America/Argentina/Tucuman": { country: "AR", subdivision: "T" },
  "America/Argentina/Ushuaia": { country: "AR", subdivision: "V" },
  "America/La_Paz": { country: "BO", subdivision: "L" },
  "America/Araguaina": { country: "BR", subdivision: "TO" },
  "America/Bahia": { country: "BR", subdivision: "BA" },
  "America/Belem": { country: "BR", subdivision: "PA" },
  "America/Boa_Vista": { country: "BR", subdivision: "RR" },
  "America/Campo_Grande": { country: "BR", subdivision: "MS" },
  "America/Cuiaba": { country: "BR", subdivision: "MT" },
  "America/Eirunepe": { country: "BR", subdivision: "AM" },
  "America/Fortaleza": { country: "BR", subdivision: "CE" },
  "America/Maceio": { country: "BR", subdivision: "AL" },
  "America/Porto_Velho": { country: "BR", subdivision: "RO" },
  "America/Recife": { country: "BR", subdivision: "PE" },
  "America/Rio_Branco": { country: "BR", subdivision: "AC" },
  "America/Santarem": { country: "BR", subdivision: "PA" },
  "America/Sao_Paulo": { country: "BR", subdivision: "SP" },
  "America/Manaus": { country: "BR", subdivision: "AM" },
  "America/Punta_Arenas": { country: "CL", subdivision: "MA" },
  "America/Santiago": { country: "CL", subdivision: "RM" },
  "America/Bogota": { country: "CO", subdivision: "DC" },
  "America/Galapagos": { country: "EC", subdivision: "W" },
  "America/Guayaquil": { country: "EC", subdivision: "G" },
  "America/Guyana": { country: "GY" },
  "America/Asuncion": { country: "PY", subdivision: "ASU" },
  "America/Lima": { country: "PE", subdivision: "LMA" },
  "America/Paramaribo": { country: "SR", subdivision: "PM" },
  "America/Montevideo": { country: "UY", subdivision: "MO" },
  "America/Caracas": { country: "VE", subdivision: "A" },
  "Europe/Paris": { country: "FR", subdivision: "IDF" },
  "Europe/London": { country: "GB", subdivision: "ENG" },
};

const LOCATION_BOUNDS: Array<{
  country: SearchCountryCode;
  subdivision: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}> = [
  {
    country: "CA",
    subdivision: "BC",
    minLat: 48,
    maxLat: 60,
    minLon: -139.2,
    maxLon: -114,
  },
  {
    country: "CA",
    subdivision: "AB",
    minLat: 49,
    maxLat: 60,
    minLon: -120.1,
    maxLon: -110,
  },
  {
    country: "CA",
    subdivision: "SK",
    minLat: 49,
    maxLat: 60,
    minLon: -110.1,
    maxLon: -101.3,
  },
  {
    country: "CA",
    subdivision: "MB",
    minLat: 49,
    maxLat: 60,
    minLon: -102.1,
    maxLon: -88.9,
  },
  {
    country: "CA",
    subdivision: "ON",
    minLat: 41.6,
    maxLat: 57.2,
    minLon: -95.2,
    maxLon: -74.2,
  },
  {
    country: "CA",
    subdivision: "QC",
    minLat: 44.8,
    maxLat: 62.8,
    minLon: -79.8,
    maxLon: -57,
  },
  {
    country: "CA",
    subdivision: "NB",
    minLat: 44.5,
    maxLat: 48.2,
    minLon: -69.2,
    maxLon: -63.7,
  },
  {
    country: "CA",
    subdivision: "NS",
    minLat: 43.2,
    maxLat: 47.1,
    minLon: -66.6,
    maxLon: -59.5,
  },
  {
    country: "CA",
    subdivision: "PE",
    minLat: 45.8,
    maxLat: 47.1,
    minLon: -64.6,
    maxLon: -61.9,
  },
  {
    country: "CA",
    subdivision: "NL",
    minLat: 46.5,
    maxLat: 60,
    minLon: -67.8,
    maxLon: -52,
  },
  {
    country: "CA",
    subdivision: "YT",
    minLat: 60,
    maxLat: 70,
    minLon: -141.1,
    maxLon: -123.8,
  },
  {
    country: "CA",
    subdivision: "NT",
    minLat: 60,
    maxLat: 74,
    minLon: -136.6,
    maxLon: -102,
  },
  {
    country: "CA",
    subdivision: "NU",
    minLat: 51,
    maxLat: 84,
    minLon: -120,
    maxLon: -61,
  },
  {
    country: "US",
    subdivision: "CA",
    minLat: 32.4,
    maxLat: 42.1,
    minLon: -124.5,
    maxLon: -114.1,
  },
  {
    country: "US",
    subdivision: "NY",
    minLat: 40.4,
    maxLat: 45.1,
    minLon: -79.8,
    maxLon: -71.8,
  },
  {
    country: "US",
    subdivision: "TX",
    minLat: 25.8,
    maxLat: 36.6,
    minLon: -106.7,
    maxLon: -93.5,
  },
  {
    country: "US",
    subdivision: "FL",
    minLat: 24.3,
    maxLat: 31.1,
    minLon: -87.7,
    maxLon: -80,
  },
  {
    country: "US",
    subdivision: "IL",
    minLat: 36.9,
    maxLat: 42.6,
    minLon: -91.6,
    maxLon: -87,
  },
  {
    country: "US",
    subdivision: "WA",
    minLat: 45.5,
    maxLat: 49.1,
    minLon: -124.9,
    maxLon: -116.9,
  },
  {
    country: "US",
    subdivision: "CO",
    minLat: 36.9,
    maxLat: 41.1,
    minLon: -109.1,
    maxLon: -102,
  },
  {
    country: "AR",
    subdivision: "",
    minLat: -55.2,
    maxLat: -21.8,
    minLon: -73.7,
    maxLon: -53.6,
  },
  {
    country: "BO",
    subdivision: "",
    minLat: -22.9,
    maxLat: -9.6,
    minLon: -69.7,
    maxLon: -57.4,
  },
  {
    country: "BR",
    subdivision: "",
    minLat: -33.8,
    maxLat: 5.4,
    minLon: -74,
    maxLon: -34.7,
  },
  {
    country: "CL",
    subdivision: "",
    minLat: -56,
    maxLat: -17.4,
    minLon: -75.7,
    maxLon: -66.4,
  },
  {
    country: "CO",
    subdivision: "",
    minLat: -4.3,
    maxLat: 13.6,
    minLon: -79.1,
    maxLon: -66.8,
  },
  {
    country: "EC",
    subdivision: "",
    minLat: -5.1,
    maxLat: 1.7,
    minLon: -92.1,
    maxLon: -75.2,
  },
  {
    country: "GY",
    subdivision: "",
    minLat: 1.1,
    maxLat: 8.7,
    minLon: -61.4,
    maxLon: -56.5,
  },
  {
    country: "PY",
    subdivision: "",
    minLat: -27.7,
    maxLat: -19.2,
    minLon: -62.7,
    maxLon: -54.2,
  },
  {
    country: "PE",
    subdivision: "",
    minLat: -18.4,
    maxLat: -0.1,
    minLon: -81.4,
    maxLon: -68.6,
  },
  {
    country: "SR",
    subdivision: "",
    minLat: 1.8,
    maxLat: 6.1,
    minLon: -58.2,
    maxLon: -53.9,
  },
  {
    country: "UY",
    subdivision: "",
    minLat: -35,
    maxLat: -30,
    minLon: -58.5,
    maxLon: -53.1,
  },
  {
    country: "VE",
    subdivision: "",
    minLat: 0.6,
    maxLat: 12.3,
    minLon: -73.4,
    maxLon: -59.8,
  },
];

function getCookie(name: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

function setStandardCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function saveConsentCookies(consent: "yes" | "no") {
  const now = new Date().toISOString();

  setStandardCookie(COOKIE_CONSENT_COOKIE, consent);
  setStandardCookie(COOKIE_CONSENT_VERSION_COOKIE, COOKIE_CONSENT_VERSION);
  setStandardCookie(COOKIE_CONSENT_UPDATED_AT_COOKIE, now);
}

function deleteOptionalLocationCookies() {
  OPTIONAL_LOCATION_COOKIES.forEach(deleteCookie);
}

function isCountryCode(value: string | null): value is SearchCountryCode {
  return COUNTRIES.some((country) => country.code === value);
}

function isSubdivisionCode(
  country: SearchCountryCode,
  value: string | null,
): value is string {
  if (!value) return false;
  return getSearchSubdivisions(country).some((item) => item.code === value);
}

function normalizeLocationText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBrowserCountry(value: unknown): SearchCountryCode | null {
  if (typeof value !== "string") return null;

  const country = value.toUpperCase();
  if (country === "UK") return "GB";
  return isCountryCode(country) ? country : null;
}

function normalizeBrowserSubdivision(
  country: SearchCountryCode,
  value: unknown,
): string {
  if (typeof value !== "string") return "";

  const subdivisions = getSearchSubdivisions(country);
  const subdivisionCode = value.split(/[-/]/).at(-1)?.toUpperCase() ?? "";

  if (isSubdivisionCode(country, subdivisionCode)) return subdivisionCode;

  const normalizedValue = normalizeLocationText(value);
  const matchedSubdivision = subdivisions.find(
    (item) => normalizeLocationText(item.label) === normalizedValue,
  );

  if (matchedSubdivision) return matchedSubdivision.code;

  const containsSubdivision = subdivisions.find((item) => {
    const label = normalizeLocationText(item.label);
    return normalizedValue.includes(label) || label.includes(normalizedValue);
  });

  return containsSubdivision?.code ?? "";
}

async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
): Promise<{
  country: SearchCountryCode;
  subdivision: string;
  city: string;
} | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    { cache: "no-store" },
  );

  if (!res.ok) return null;

  const data: unknown = await res.json();
  if (!isRecord(data)) return null;

  const country = normalizeBrowserCountry(data.countryCode);
  if (!country) return null;

  return {
    country,
    subdivision: normalizeBrowserSubdivision(
      country,
      data.principalSubdivisionCode || data.principalSubdivision,
    ),
    city:
      typeof data.city === "string"
        ? data.city
        : typeof data.locality === "string"
          ? data.locality
          : typeof data.localityInfo === "object" &&
              data.localityInfo !== null &&
              Array.isArray(
                (data.localityInfo as Record<string, unknown>).administrative,
              )
            ? getAdministrativeCityName(data.localityInfo)
            : "",
  };
}

function getAdministrativeCityName(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.administrative)) return "";

  const city = value.administrative.find(
    (item) =>
      isRecord(item) && item.adminLevel === 8 && typeof item.name === "string",
  );

  if (isRecord(city) && typeof city.name === "string") return city.name;

  return "";
}

function detectFallbackLocation(): {
  country: SearchCountryCode;
  subdivision: string;
  city: string;
} {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneDefault = TIMEZONE_DEFAULTS[timeZone];

  if (timezoneDefault) {
    return {
      country: timezoneDefault.country,
      subdivision: timezoneDefault.subdivision ?? "",
      city: "",
    };
  }

  const languageRegion = navigator.languages
    ?.map((language) => language.split("-")[1]?.toUpperCase())
    .find(Boolean);

  if (languageRegion === "US")
    return { country: "US", subdivision: "", city: "" };
  if (languageRegion === "AR")
    return { country: "AR", subdivision: "", city: "" };
  if (languageRegion === "BO")
    return { country: "BO", subdivision: "", city: "" };
  if (languageRegion === "BR")
    return { country: "BR", subdivision: "", city: "" };
  if (languageRegion === "CL")
    return { country: "CL", subdivision: "", city: "" };
  if (languageRegion === "CO")
    return { country: "CO", subdivision: "", city: "" };
  if (languageRegion === "EC")
    return { country: "EC", subdivision: "", city: "" };
  if (languageRegion === "FR")
    return { country: "FR", subdivision: "", city: "" };
  if (languageRegion === "GB" || languageRegion === "UK") {
    return { country: "GB", subdivision: "", city: "" };
  }
  if (languageRegion === "GY")
    return { country: "GY", subdivision: "", city: "" };
  if (languageRegion === "PY")
    return { country: "PY", subdivision: "", city: "" };
  if (languageRegion === "PE")
    return { country: "PE", subdivision: "", city: "" };
  if (languageRegion === "SR")
    return { country: "SR", subdivision: "", city: "" };
  if (languageRegion === "UY")
    return { country: "UY", subdivision: "", city: "" };
  if (languageRegion === "VE")
    return { country: "VE", subdivision: "", city: "" };
  if (languageRegion === "CA")
    return { country: "CA", subdivision: "", city: "" };

  return { country: "CA", subdivision: "", city: "" };
}

function resolveCoordinates(
  latitude: number,
  longitude: number,
): {
  country: SearchCountryCode;
  subdivision: string;
  city: string;
} {
  const fallback = detectFallbackLocation();
  const matches = LOCATION_BOUNDS.filter(
    (item) =>
      latitude >= item.minLat &&
      latitude <= item.maxLat &&
      longitude >= item.minLon &&
      longitude <= item.maxLon,
  );
  const match = matches.sort(
    (a, b) =>
      (a.maxLat - a.minLat) * (a.maxLon - a.minLon) -
      (b.maxLat - b.minLat) * (b.maxLon - b.minLon),
  )[0];

  if (match) {
    if (!match.subdivision && fallback.country === match.country) {
      return fallback;
    }

    return { country: match.country, subdivision: match.subdivision, city: "" };
  }

  if (
    latitude >= 41 &&
    latitude <= 84 &&
    longitude >= -142 &&
    longitude <= -52
  ) {
    return { country: "CA", subdivision: "", city: "" };
  }

  if (
    latitude >= 24 &&
    latitude <= 50 &&
    longitude >= -125 &&
    longitude <= -66
  ) {
    return { country: "US", subdivision: "", city: "" };
  }

  return fallback;
}

function getBrowserLocation(): Promise<{
  country: SearchCountryCode;
  subdivision: string;
  city: string;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        reverseGeocodeCoordinates(latitude, longitude)
          .then((detected) => {
            resolve(detected ?? resolveCoordinates(latitude, longitude));
          })
          .catch(() => {
            resolve(resolveCoordinates(latitude, longitude));
          });
      },
      reject,
      {
        enableHighAccuracy: false,
        maximumAge: 60 * 60 * 1000,
        timeout: 10000,
      },
    );
  });
}

export function LocationCookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [area, setArea] = useState<LocationAreaCode>("CA");
  const [country, setCountry] = useState<SearchCountryCode>("CA");
  const [subdivision, setSubdivision] = useState("");
  const [city, setCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const subdivisions = useMemo(() => getSearchSubdivisions(country), [country]);
  const areaCountries = useMemo(() => getCountriesForArea(area), [area]);
  const showCountrySelect = areaCountries.length > 1;
  const countryLevelOnly = useMemo(
    () => isCountryLevelOnlyRegion(country),
    [country],
  );
  const currentCountryLabel = useMemo(
    () => getCountryLabel(country),
    [country],
  );
  const currentSubdivisionLabel = useMemo(
    () =>
      subdivisions.find((item) => item.code === subdivision)?.label ??
      "Province/state/region not selected",
    [subdivision, subdivisions],
  );

  useEffect(() => {
    const savedCountry = getCookie(COUNTRY_COOKIE) || getCookie(REGION_COOKIE);
    const savedSubdivision = getCookie(SUBDIVISION_COOKIE);
    const savedCity = getCookie(CITY_COOKIE);
    const consent = getCookie(COOKIE_CONSENT_COOKIE);
    const consentVersion = getCookie(COOKIE_CONSENT_VERSION_COOKIE);
    const fallback = detectFallbackLocation();

    const initialCountry = isCountryCode(savedCountry)
      ? savedCountry
      : fallback.country;
    const initialSubdivision = isSubdivisionCode(
      initialCountry,
      savedSubdivision,
    )
      ? savedSubdivision
      : fallback.subdivision;

    setCountry(initialCountry);
    setArea(getAreaForCountry(initialCountry));
    setSubdivision(
      isSubdivisionCode(initialCountry, initialSubdivision)
        ? initialSubdivision
        : "",
    );
    setCity(savedCity?.trim() || fallback.city);
    setVisible(
      (consent !== "yes" && consent !== "no") ||
        consentVersion !== COOKIE_CONSENT_VERSION,
    );
    setMounted(true);
  }, []);

  const updateArea = (nextArea: LocationAreaCode) => {
    const nextCountry = getCountriesForArea(nextArea)[0] ?? "CA";

    setArea(nextArea);
    setCountry(nextCountry);
    setSubdivision("");
    setCity("");
  };

  const updateCountry = (nextCountry: SearchCountryCode) => {
    setArea(getAreaForCountry(nextCountry));
    setCountry(nextCountry);
    setSubdivision("");
    setCity("");
  };

  const saveLocationCookies = (
    selectedCountry = country,
    selectedSubdivision = subdivision,
    selectedCity = city,
    source: "browser" | "manual" = "manual",
  ) => {
    const countryOnly = isCountryLevelOnlyRegion(selectedCountry);
    const validSubdivision = isSubdivisionCode(
      selectedCountry,
      selectedSubdivision,
    )
      ? selectedSubdivision
      : "";
    const validCity = countryOnly ? "" : selectedCity.trim();

    saveConsentCookies("yes");
    setStandardCookie(COUNTRY_COOKIE, selectedCountry);
    setStandardCookie(REGION_COOKIE, selectedCountry);
    setStandardCookie(LOCATION_SOURCE_COOKIE, source);
    setStandardCookie(LOCATION_UPDATED_AT_COOKIE, new Date().toISOString());
    setStandardCookie(
      LOCATION_PRECISION_COOKIE,
      source === "browser" ? "browser_geolocation" : "manual_selection",
    );

    if (validSubdivision && !countryOnly) {
      setStandardCookie(SUBDIVISION_COOKIE, validSubdivision);
    } else {
      deleteCookie(SUBDIVISION_COOKIE);
    }

    if (validCity) {
      setStandardCookie(CITY_COOKIE, validCity);
    } else {
      deleteCookie(CITY_COOKIE);
    }

    setVisible(false);
  };

  const continueWithoutLocationCookies = () => {
    saveConsentCookies("no");
    deleteOptionalLocationCookies();
    setVisible(false);
  };

  const useCurrentPosition = async () => {
    setLocating(true);
    setLocationError("");

    try {
      const detected = await getBrowserLocation();
      const countryOnly = isCountryLevelOnlyRegion(detected.country);
      setArea(getAreaForCountry(detected.country));
      setCountry(detected.country);
      setSubdivision(countryOnly ? "" : detected.subdivision);
      setCity(countryOnly ? "" : detected.city);
      saveLocationCookies(
        detected.country,
        countryOnly ? "" : detected.subdivision,
        countryOnly ? "" : detected.city,
        "browser",
      );
    } catch {
      setManualOpen(true);
      setLocationError(
        "Location permission was not available. Choose your region manually.",
      );
    } finally {
      setLocating(false);
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3 p-4">
        <div className="rounded-full bg-blue-50 p-2 text-blue-700">
          <MapPin className="h-4 w-4 md:h-6 md:w-6" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-950">
                Autoriser l'utilisation de votre position
              </p>
              <p className=" text-xs leading-5 text-slate-600">
                Utilisez votre position pour obtenir des produits de votre
                région.
              </p>
            </div>
            <button
              type="button"
              onClick={continueWithoutLocationCookies}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close location prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {locationError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {locationError}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={useCurrentPosition}
              disabled={locating}
              className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              <LocateFixed className="h-4 w-4" />
              {locating ? "Détection en cours..." : "Utiliser ma position"}
            </button>
            <button
              type="button"
              onClick={() => setManualOpen((value) => !value)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Sélection manuelle
            </button>
          </div>

          {manualOpen && (
            <div className="rounded-xl border max-w-xs border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 ">
                <select
                  value={area}
                  onChange={(event) =>
                    updateArea(event.target.value as LocationAreaCode)
                  }
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                >
                  {LOCATION_AREAS.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {showCountrySelect && (
                  <select
                    value={country}
                    onChange={(event) =>
                      updateCountry(event.target.value as SearchCountryCode)
                    }
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                  >
                    {areaCountries.map((countryCode) => (
                      <option key={countryCode} value={countryCode}>
                        {getCountryLabel(countryCode)}
                      </option>
                    ))}
                  </select>
                )}
                {!countryLevelOnly && (
                  <>
                    <select
                      value={subdivision}
                      onChange={(event) => setSubdivision(event.target.value)}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="">Province / state / region</option>
                      {subdivisions.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="City"
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                    />
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  saveLocationCookies(country, subdivision, city, "manual")
                }
                className="inline-flex h-8 items-center justify-center mt-2 gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
              <p className="mt-2 text-[11px] text-slate-500">
                Selected: {currentCountryLabel}
                {!countryLevelOnly ? ` - ${currentSubdivisionLabel}` : ""}
                {!countryLevelOnly && city.trim() ? ` - ${city.trim()}` : ""}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={continueWithoutLocationCookies}
            className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline"
          >
            Continuez sans utiliser la position
          </button>
        </div>
      </div>
    </div>
  );
}
