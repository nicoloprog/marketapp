import type { NextRequest } from "next/server";

export type SearchCountryCode =
  | "CA"
  | "US"
  | "FR"
  | "GB"
  | "AR"
  | "BO"
  | "BR"
  | "CL"
  | "CO"
  | "EC"
  | "GY"
  | "PY"
  | "PE"
  | "SR"
  | "UY"
  | "VE";

export type SearchSubdivision = {
  code: string;
  label: string;
};

export type SearchRegion = {
  code: SearchCountryCode;
  country: string;
  googleDomain: string;
  googleLanguage: string;
  amazonDomain: string;
  label: string;
  subdivision?: SearchSubdivision;
  city?: string;
};

type BaseSearchRegion = Omit<SearchRegion, "subdivision" | "city">;

export const COOKIE_CONSENT_COOKIE = "bp_cookie_consent";
export const COUNTRY_COOKIE = "bp_country";
export const SUBDIVISION_COOKIE = "bp_subdivision";
export const CITY_COOKIE = "bp_city";
export const LOCATION_SOURCE_COOKIE = "bp_location_source";

// Backward compatibility for users who already received the first region cookie.
export const REGION_COOKIE = "bp_region";

const REGIONS: Record<SearchCountryCode, BaseSearchRegion> = {
  CA: {
    code: "CA",
    country: "ca",
    googleDomain: "google.ca",
    googleLanguage: "fr",
    amazonDomain: "ca",
    label: "Canada",
  },
  US: {
    code: "US",
    country: "us",
    googleDomain: "google.com",
    googleLanguage: "en",
    amazonDomain: "com",
    label: "United States",
  },
  FR: {
    code: "FR",
    country: "fr",
    googleDomain: "google.fr",
    googleLanguage: "fr",
    amazonDomain: "fr",
    label: "France",
  },
  GB: {
    code: "GB",
    country: "gb",
    googleDomain: "google.co.uk",
    googleLanguage: "en",
    amazonDomain: "co.uk",
    label: "United Kingdom",
  },
  AR: {
    code: "AR",
    country: "ar",
    googleDomain: "google.com.ar",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Argentina",
  },
  BO: {
    code: "BO",
    country: "bo",
    googleDomain: "google.com.bo",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Bolivia",
  },
  BR: {
    code: "BR",
    country: "br",
    googleDomain: "google.com.br",
    googleLanguage: "pt",
    amazonDomain: "com.br",
    label: "Brazil",
  },
  CL: {
    code: "CL",
    country: "cl",
    googleDomain: "google.cl",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Chile",
  },
  CO: {
    code: "CO",
    country: "co",
    googleDomain: "google.com.co",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Colombia",
  },
  EC: {
    code: "EC",
    country: "ec",
    googleDomain: "google.com.ec",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Ecuador",
  },
  GY: {
    code: "GY",
    country: "gy",
    googleDomain: "google.gy",
    googleLanguage: "en",
    amazonDomain: "com",
    label: "Guyana",
  },
  PY: {
    code: "PY",
    country: "py",
    googleDomain: "google.com.py",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Paraguay",
  },
  PE: {
    code: "PE",
    country: "pe",
    googleDomain: "google.com.pe",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Peru",
  },
  SR: {
    code: "SR",
    country: "sr",
    googleDomain: "google.sr",
    googleLanguage: "nl",
    amazonDomain: "com",
    label: "Suriname",
  },
  UY: {
    code: "UY",
    country: "uy",
    googleDomain: "google.com.uy",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Uruguay",
  },
  VE: {
    code: "VE",
    country: "ve",
    googleDomain: "google.co.ve",
    googleLanguage: "es",
    amazonDomain: "com",
    label: "Venezuela",
  },
};

const COUNTRY_LEVEL_ONLY_COUNTRIES: SearchCountryCode[] = [
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
];

const SUBDIVISIONS: Record<SearchCountryCode, SearchSubdivision[]> = {
  CA: [
    { code: "AB", label: "Alberta" },
    { code: "BC", label: "British Columbia" },
    { code: "MB", label: "Manitoba" },
    { code: "NB", label: "New Brunswick" },
    { code: "NL", label: "Newfoundland and Labrador" },
    { code: "NS", label: "Nova Scotia" },
    { code: "NT", label: "Northwest Territories" },
    { code: "NU", label: "Nunavut" },
    { code: "ON", label: "Ontario" },
    { code: "PE", label: "Prince Edward Island" },
    { code: "QC", label: "Quebec" },
    { code: "SK", label: "Saskatchewan" },
    { code: "YT", label: "Yukon" },
  ],
  US: [
    { code: "AL", label: "Alabama" },
    { code: "AK", label: "Alaska" },
    { code: "AZ", label: "Arizona" },
    { code: "AR", label: "Arkansas" },
    { code: "CA", label: "California" },
    { code: "CO", label: "Colorado" },
    { code: "CT", label: "Connecticut" },
    { code: "DE", label: "Delaware" },
    { code: "DC", label: "District of Columbia" },
    { code: "FL", label: "Florida" },
    { code: "GA", label: "Georgia" },
    { code: "HI", label: "Hawaii" },
    { code: "ID", label: "Idaho" },
    { code: "IL", label: "Illinois" },
    { code: "IN", label: "Indiana" },
    { code: "IA", label: "Iowa" },
    { code: "KS", label: "Kansas" },
    { code: "KY", label: "Kentucky" },
    { code: "LA", label: "Louisiana" },
    { code: "ME", label: "Maine" },
    { code: "MD", label: "Maryland" },
    { code: "MA", label: "Massachusetts" },
    { code: "MI", label: "Michigan" },
    { code: "MN", label: "Minnesota" },
    { code: "MS", label: "Mississippi" },
    { code: "MO", label: "Missouri" },
    { code: "MT", label: "Montana" },
    { code: "NE", label: "Nebraska" },
    { code: "NV", label: "Nevada" },
    { code: "NH", label: "New Hampshire" },
    { code: "NJ", label: "New Jersey" },
    { code: "NM", label: "New Mexico" },
    { code: "NY", label: "New York" },
    { code: "NC", label: "North Carolina" },
    { code: "ND", label: "North Dakota" },
    { code: "OH", label: "Ohio" },
    { code: "OK", label: "Oklahoma" },
    { code: "OR", label: "Oregon" },
    { code: "PA", label: "Pennsylvania" },
    { code: "RI", label: "Rhode Island" },
    { code: "SC", label: "South Carolina" },
    { code: "SD", label: "South Dakota" },
    { code: "TN", label: "Tennessee" },
    { code: "TX", label: "Texas" },
    { code: "UT", label: "Utah" },
    { code: "VT", label: "Vermont" },
    { code: "VA", label: "Virginia" },
    { code: "WA", label: "Washington" },
    { code: "WV", label: "West Virginia" },
    { code: "WI", label: "Wisconsin" },
    { code: "WY", label: "Wyoming" },
  ],
  FR: [
    { code: "ARA", label: "Auvergne-Rhone-Alpes" },
    { code: "BFC", label: "Bourgogne-Franche-Comte" },
    { code: "BRE", label: "Bretagne" },
    { code: "CVL", label: "Centre-Val de Loire" },
    { code: "GES", label: "Grand Est" },
    { code: "HDF", label: "Hauts-de-France" },
    { code: "IDF", label: "Ile-de-France" },
    { code: "NAQ", label: "Nouvelle-Aquitaine" },
    { code: "NOR", label: "Normandie" },
    { code: "OCC", label: "Occitanie" },
    { code: "PAC", label: "Provence-Alpes-Cote d'Azur" },
    { code: "PDL", label: "Pays de la Loire" },
  ],
  GB: [
    { code: "ENG", label: "England" },
    { code: "SCT", label: "Scotland" },
    { code: "WLS", label: "Wales" },
    { code: "NIR", label: "Northern Ireland" },
  ],
  AR: [
    { code: "C", label: "Buenos Aires City" },
    { code: "B", label: "Buenos Aires Province" },
    { code: "K", label: "Catamarca" },
    { code: "H", label: "Chaco" },
    { code: "U", label: "Chubut" },
    { code: "X", label: "Cordoba" },
    { code: "W", label: "Corrientes" },
    { code: "E", label: "Entre Rios" },
    { code: "P", label: "Formosa" },
    { code: "Y", label: "Jujuy" },
    { code: "L", label: "La Pampa" },
    { code: "F", label: "La Rioja" },
    { code: "M", label: "Mendoza" },
    { code: "N", label: "Misiones" },
    { code: "Q", label: "Neuquen" },
    { code: "R", label: "Rio Negro" },
    { code: "A", label: "Salta" },
    { code: "J", label: "San Juan" },
    { code: "D", label: "San Luis" },
    { code: "Z", label: "Santa Cruz" },
    { code: "S", label: "Santa Fe" },
    { code: "G", label: "Santiago del Estero" },
    { code: "V", label: "Tierra del Fuego" },
    { code: "T", label: "Tucuman" },
  ],
  BO: [
    { code: "B", label: "Beni" },
    { code: "H", label: "Chuquisaca" },
    { code: "C", label: "Cochabamba" },
    { code: "L", label: "La Paz" },
    { code: "O", label: "Oruro" },
    { code: "N", label: "Pando" },
    { code: "P", label: "Potosi" },
    { code: "S", label: "Santa Cruz" },
    { code: "T", label: "Tarija" },
  ],
  BR: [
    { code: "AC", label: "Acre" },
    { code: "AL", label: "Alagoas" },
    { code: "AP", label: "Amapa" },
    { code: "AM", label: "Amazonas" },
    { code: "BA", label: "Bahia" },
    { code: "CE", label: "Ceara" },
    { code: "DF", label: "Distrito Federal" },
    { code: "ES", label: "Espirito Santo" },
    { code: "GO", label: "Goias" },
    { code: "MA", label: "Maranhao" },
    { code: "MT", label: "Mato Grosso" },
    { code: "MS", label: "Mato Grosso do Sul" },
    { code: "MG", label: "Minas Gerais" },
    { code: "PA", label: "Para" },
    { code: "PB", label: "Paraiba" },
    { code: "PR", label: "Parana" },
    { code: "PE", label: "Pernambuco" },
    { code: "PI", label: "Piaui" },
    { code: "RJ", label: "Rio de Janeiro" },
    { code: "RN", label: "Rio Grande do Norte" },
    { code: "RS", label: "Rio Grande do Sul" },
    { code: "RO", label: "Rondonia" },
    { code: "RR", label: "Roraima" },
    { code: "SC", label: "Santa Catarina" },
    { code: "SP", label: "Sao Paulo" },
    { code: "SE", label: "Sergipe" },
    { code: "TO", label: "Tocantins" },
  ],
  CL: [
    { code: "AP", label: "Arica and Parinacota" },
    { code: "TA", label: "Tarapaca" },
    { code: "AN", label: "Antofagasta" },
    { code: "AT", label: "Atacama" },
    { code: "CO", label: "Coquimbo" },
    { code: "VS", label: "Valparaiso" },
    { code: "RM", label: "Santiago Metropolitan" },
    { code: "LI", label: "O'Higgins" },
    { code: "ML", label: "Maule" },
    { code: "NB", label: "Nuble" },
    { code: "BI", label: "Biobio" },
    { code: "AR", label: "Araucania" },
    { code: "LR", label: "Los Rios" },
    { code: "LL", label: "Los Lagos" },
    { code: "AI", label: "Aysen" },
    { code: "MA", label: "Magallanes" },
  ],
  CO: [
    { code: "AMA", label: "Amazonas" },
    { code: "ANT", label: "Antioquia" },
    { code: "ARA", label: "Arauca" },
    { code: "ATL", label: "Atlantico" },
    { code: "BOL", label: "Bolivar" },
    { code: "BOY", label: "Boyaca" },
    { code: "CAL", label: "Caldas" },
    { code: "CAQ", label: "Caqueta" },
    { code: "CAS", label: "Casanare" },
    { code: "CAU", label: "Cauca" },
    { code: "CES", label: "Cesar" },
    { code: "CHO", label: "Choco" },
    { code: "COR", label: "Cordoba" },
    { code: "CUN", label: "Cundinamarca" },
    { code: "DC", label: "Bogota" },
    { code: "GUA", label: "Guainia" },
    { code: "GUV", label: "Guaviare" },
    { code: "HUI", label: "Huila" },
    { code: "LAG", label: "La Guajira" },
    { code: "MAG", label: "Magdalena" },
    { code: "MET", label: "Meta" },
    { code: "NAR", label: "Narino" },
    { code: "NSA", label: "Norte de Santander" },
    { code: "PUT", label: "Putumayo" },
    { code: "QUI", label: "Quindio" },
    { code: "RIS", label: "Risaralda" },
    { code: "SAP", label: "San Andres and Providencia" },
    { code: "SAN", label: "Santander" },
    { code: "SUC", label: "Sucre" },
    { code: "TOL", label: "Tolima" },
    { code: "VAC", label: "Valle del Cauca" },
    { code: "VAU", label: "Vaupes" },
    { code: "VID", label: "Vichada" },
  ],
  EC: [
    { code: "A", label: "Azuay" },
    { code: "B", label: "Bolivar" },
    { code: "F", label: "Canar" },
    { code: "C", label: "Carchi" },
    { code: "H", label: "Chimborazo" },
    { code: "X", label: "Cotopaxi" },
    { code: "O", label: "El Oro" },
    { code: "E", label: "Esmeraldas" },
    { code: "W", label: "Galapagos" },
    { code: "G", label: "Guayas" },
    { code: "I", label: "Imbabura" },
    { code: "L", label: "Loja" },
    { code: "R", label: "Los Rios" },
    { code: "M", label: "Manabi" },
    { code: "S", label: "Morona Santiago" },
    { code: "N", label: "Napo" },
    { code: "D", label: "Orellana" },
    { code: "Y", label: "Pastaza" },
    { code: "P", label: "Pichincha" },
    { code: "SE", label: "Santa Elena" },
    { code: "SD", label: "Santo Domingo de los Tsachilas" },
    { code: "U", label: "Sucumbios" },
    { code: "T", label: "Tungurahua" },
    { code: "Z", label: "Zamora Chinchipe" },
  ],
  GY: [
    { code: "BA", label: "Barima-Waini" },
    { code: "CU", label: "Cuyuni-Mazaruni" },
    { code: "DE", label: "Demerara-Mahaica" },
    { code: "EB", label: "East Berbice-Corentyne" },
    { code: "ES", label: "Essequibo Islands-West Demerara" },
    { code: "MA", label: "Mahaica-Berbice" },
    { code: "PM", label: "Pomeroon-Supenaam" },
    { code: "PT", label: "Potaro-Siparuni" },
    { code: "UD", label: "Upper Demerara-Berbice" },
    { code: "UT", label: "Upper Takutu-Upper Essequibo" },
  ],
  PY: [
    { code: "ASU", label: "Asuncion" },
    { code: "16", label: "Alto Paraguay" },
    { code: "10", label: "Alto Parana" },
    { code: "13", label: "Amambay" },
    { code: "19", label: "Boqueron" },
    { code: "5", label: "Caaguazu" },
    { code: "6", label: "Caazapa" },
    { code: "14", label: "Canindeyu" },
    { code: "11", label: "Central" },
    { code: "1", label: "Concepcion" },
    { code: "3", label: "Cordillera" },
    { code: "4", label: "Guaira" },
    { code: "7", label: "Itapua" },
    { code: "8", label: "Misiones" },
    { code: "9", label: "Paraguari" },
    { code: "15", label: "Presidente Hayes" },
    { code: "2", label: "San Pedro" },
  ],
  PE: [
    { code: "AMA", label: "Amazonas" },
    { code: "ANC", label: "Ancash" },
    { code: "APU", label: "Apurimac" },
    { code: "ARE", label: "Arequipa" },
    { code: "AYA", label: "Ayacucho" },
    { code: "CAJ", label: "Cajamarca" },
    { code: "CAL", label: "Callao" },
    { code: "CUS", label: "Cusco" },
    { code: "HUV", label: "Huancavelica" },
    { code: "HUC", label: "Huanuco" },
    { code: "ICA", label: "Ica" },
    { code: "JUN", label: "Junin" },
    { code: "LAL", label: "La Libertad" },
    { code: "LAM", label: "Lambayeque" },
    { code: "LIM", label: "Lima Region" },
    { code: "LMA", label: "Lima Province" },
    { code: "LOR", label: "Loreto" },
    { code: "MDD", label: "Madre de Dios" },
    { code: "MOQ", label: "Moquegua" },
    { code: "PAS", label: "Pasco" },
    { code: "PIU", label: "Piura" },
    { code: "PUN", label: "Puno" },
    { code: "SAM", label: "San Martin" },
    { code: "TAC", label: "Tacna" },
    { code: "TUM", label: "Tumbes" },
    { code: "UCA", label: "Ucayali" },
  ],
  SR: [
    { code: "BR", label: "Brokopondo" },
    { code: "CM", label: "Commewijne" },
    { code: "CR", label: "Coronie" },
    { code: "MA", label: "Marowijne" },
    { code: "NI", label: "Nickerie" },
    { code: "PR", label: "Para" },
    { code: "PM", label: "Paramaribo" },
    { code: "SA", label: "Saramacca" },
    { code: "SI", label: "Sipaliwini" },
    { code: "WA", label: "Wanica" },
  ],
  UY: [
    { code: "AR", label: "Artigas" },
    { code: "CA", label: "Canelones" },
    { code: "CL", label: "Cerro Largo" },
    { code: "CO", label: "Colonia" },
    { code: "DU", label: "Durazno" },
    { code: "FS", label: "Flores" },
    { code: "FD", label: "Florida" },
    { code: "LA", label: "Lavalleja" },
    { code: "MA", label: "Maldonado" },
    { code: "MO", label: "Montevideo" },
    { code: "PA", label: "Paysandu" },
    { code: "RN", label: "Rio Negro" },
    { code: "RV", label: "Rivera" },
    { code: "RO", label: "Rocha" },
    { code: "SA", label: "Salto" },
    { code: "SJ", label: "San Jose" },
    { code: "SO", label: "Soriano" },
    { code: "TA", label: "Tacuarembo" },
    { code: "TT", label: "Treinta y Tres" },
  ],
  VE: [
    { code: "Z", label: "Amazonas" },
    { code: "B", label: "Anzoategui" },
    { code: "C", label: "Apure" },
    { code: "D", label: "Aragua" },
    { code: "E", label: "Barinas" },
    { code: "F", label: "Bolivar" },
    { code: "G", label: "Carabobo" },
    { code: "H", label: "Cojedes" },
    { code: "Y", label: "Delta Amacuro" },
    { code: "A", label: "Capital District" },
    { code: "I", label: "Falcon" },
    { code: "J", label: "Guarico" },
    { code: "K", label: "Lara" },
    { code: "L", label: "Merida" },
    { code: "M", label: "Miranda" },
    { code: "N", label: "Monagas" },
    { code: "O", label: "Nueva Esparta" },
    { code: "P", label: "Portuguesa" },
    { code: "R", label: "Sucre" },
    { code: "S", label: "Tachira" },
    { code: "T", label: "Trujillo" },
    { code: "X", label: "Vargas" },
    { code: "U", label: "Yaracuy" },
    { code: "V", label: "Zulia" },
  ],
};

function normalizeCountryCode(code?: string | null): SearchCountryCode {
  const normalizedCode = code?.toUpperCase() as SearchCountryCode | undefined;
  return normalizedCode && REGIONS[normalizedCode] ? normalizedCode : "CA";
}

export function isCountryLevelOnlyRegion(
  countryCode: SearchCountryCode,
): boolean {
  return COUNTRY_LEVEL_ONLY_COUNTRIES.includes(countryCode);
}

export function getSearchSubdivision(
  countryCode: SearchCountryCode,
  subdivisionCode?: string | null,
): SearchSubdivision | undefined {
  if (isCountryLevelOnlyRegion(countryCode)) return undefined;

  const normalizedCode = subdivisionCode?.toUpperCase();
  if (!normalizedCode) return undefined;

  return SUBDIVISIONS[countryCode].find(
    (subdivision) => subdivision.code === normalizedCode,
  );
}

export function getSearchRegion(
  countryCode?: string | null,
  subdivisionCode?: string | null,
  city?: string | null,
): SearchRegion {
  const code = normalizeCountryCode(countryCode);
  const subdivision = getSearchSubdivision(code, subdivisionCode);
  const normalizedCity = isCountryLevelOnlyRegion(code) ? "" : city?.trim();

  return {
    ...REGIONS[code],
    ...(subdivision ? { subdivision } : {}),
    ...(normalizedCity ? { city: normalizedCity } : {}),
  };
}

export function getSearchRegionFromRequest(req: NextRequest): SearchRegion {
  const consent = req.cookies.get(COOKIE_CONSENT_COOKIE)?.value;
  if (consent !== "yes") return getSearchRegion();

  const country =
    req.cookies.get(COUNTRY_COOKIE)?.value ||
    req.cookies.get(REGION_COOKIE)?.value;
  const subdivision = req.cookies.get(SUBDIVISION_COOKIE)?.value;
  const city = req.cookies.get(CITY_COOKIE)?.value;

  return getSearchRegion(country, subdivision, city);
}

export function getSearchRegions(): SearchRegion[] {
  return Object.values(REGIONS);
}

export function getSearchSubdivisions(
  countryCode: SearchCountryCode,
): SearchSubdivision[] {
  if (isCountryLevelOnlyRegion(countryCode)) return [];

  return SUBDIVISIONS[countryCode];
}
