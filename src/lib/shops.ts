// Curated directory of online first aid shops that ship to their country.
// Pattern mirrors `donations.ts`: each country lists up to three vendors,
// preferring St John where present, plus reputable national alternatives.
// `null` means no national online store — we fall back to international.

import { COUNTRIES, type CountryCode, getCountry, DEFAULT_COUNTRY } from "@/lib/donations";

export type ShopId = "stjohn" | "redcross" | "national";

export type ShopMeta = {
  id: ShopId;
  name: string;
  short: string;
  international: string;
};

export const SHOPS: Record<ShopId, ShopMeta> = {
  stjohn: {
    id: "stjohn",
    name: "St John First Aid Shop",
    short: "St John First Aid",
    international: "https://shop.stjohn.org.au/" },
  redcross: {
    id: "redcross",
    name: "Red Cross First Aid Shop",
    short: "Red Cross Shop",
    international: "https://www.redcross.org.uk/shop" },
  national: {
    id: "national",
    name: "National First Aid Supplier",
    short: "National Supplier",
    international: "https://www.firstaidonly.com/" } };

/** Per-country online shops. Keys map to a SHOPS id. URL `null` = no national store. */
export const COUNTRY_SHOPS: Record<string, Partial<Record<ShopId, string>>> = {
  // ───── Oceania ─────
  AU: {
    stjohn: "https://shop.stjohn.org.au/",
    redcross: "https://shop.redcross.org.au/",
    national: "https://www.survival.net.au/collections/first-aid-kits" },
  NZ: {
    stjohn: "https://shop.stjohn.org.nz/",
    national: "https://www.firstaid.co.nz/" },
  FJ: {},
  PG: {},

  // ───── UK & Ireland ─────
  GB: {
    stjohn: "https://www.sja.org.uk/first-aid-supplies/",
    national: "https://www.firstaid4less.co.uk/" },
  IE: {},

  // ───── North America ─────
  US: {
    redcross: "https://www.redcrossstore.org/",
    national: "https://www.firstaidonly.com/" },
  CA: {
    stjohn: "https://www.sja.ca/en/shop",
    redcross: "https://shop.redcross.ca/" },
  MX: {},

  // ───── Latin America ─────
  BR: {},
  AR: {},
  CL: { national: "https://www.primerosauxilios.cl/" },
  CO: {},
  PE: {},

  // ───── Western Europe ─────
  DE: {
    redcross: "https://shop.drk.de/",
    national: "https://www.holthaus-medical.com/" },
  FR: {},
  IT: {
    redcross: "https://shop.cri.it/" },
  ES: {},
  PT: {},
  NL: { redcross: "https://shop.rodekruis.nl/", national: "https://www.ehbo-shop.nl/" },
  BE: { redcross: "https://shop.rodekruis.be/" },
  LU: {},
  CH: { redcross: "https://shop.redcross.ch/" },
  AT: { redcross: "https://shop.roteskreuz.at/" },

  // ───── Nordics ─────
  SE: { national: "https://www.medic24.se/" },
  NO: { national: "https://www.norsafe.no/" },
  DK: { redcross: "https://shop.rodekors.dk/" },
  FI: { national: "https://www.ensiapu.fi/" },
  IS: {},

  // ───── Central & Eastern Europe ─────
  PL: { redcross: "https://sklep.pck.pl/", national: "https://www.apteczki.pl/" },
  CZ: { redcross: "https://shop.cervenykriz.eu/", national: "https://www.lekarnicky.cz/" },
  SK: { redcross: "https://shop.redcross.sk/" },
  HU: {},
  RO: {},
  BG: {},
  HR: {},
  SI: {},
  RS: {},
  GR: {},
  UA: {},
  EE: {},
  LV: {},
  LT: {},
  CY: {},
  MT: {},

  // ───── Middle East & North Africa ─────
  IL: {},
  AE: {},
  SA: {},
  TR: {},
  EG: {},
  MA: {},

  // ───── Sub-Saharan Africa ─────
  ZA: {
    stjohn: "https://stjohn.org.za/shop/",
    redcross: "https://shop.redcross.org.za/",
    national: "https://www.firstaidkits.co.za/" },
  KE: { stjohn: "https://www.stjohnkenya.org/shop/" },
  NG: {},
  GH: {},
  TZ: {},
  UG: {},
  ET: {},
  ZW: {},
  ZM: {},
  MW: {},
  NA: {},
  BW: {},
  MU: {},

  // ───── South Asia ─────
  IN: {
    national: "https://www.firstaidindia.com/" },
  PK: {},
  BD: {},
  LK: {},
  NP: {},

  // ───── East & Southeast Asia ─────
  JP: { national: "https://www.amazon.co.jp/s?k=救急セット" },
  KR: {},
  TW: {},
  HK: {
    stjohn: "https://www.stjohn.org.hk/en/shop/" },
  SG: {},
  MY: {
    redcross: "https://shop.redcrescent.org.my/" },
  TH: {},
  PH: {},
  ID: {},
  VN: {},

  // ───── Caribbean ─────
  JM: {},
  TT: {},
  BB: {},
  BS: {} };

export function shopsForCountry(code: string | null | undefined): Array<{ id: ShopId; url: string; isNational: boolean }> {
  const country = getCountry(code ?? DEFAULT_COUNTRY);
  const national = COUNTRY_SHOPS[country.code] ?? {};
  // Maintain a stable order: St John, Red Cross, National.
  const order: ShopId[] = ["stjohn", "redcross", "national"];
  return order.map((id) => {
    const url = national[id];
    return { id, url: url ?? SHOPS[id].international, isNational: !!url };
  });
}

export function shopUrl(code: string | null | undefined, id: ShopId): string {
  const national = COUNTRY_SHOPS[(code ?? DEFAULT_COUNTRY) as CountryCode];
  return national?.[id] ?? SHOPS[id].international;
}

export { COUNTRIES };
