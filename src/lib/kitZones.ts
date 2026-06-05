// 4 shipping zones for St John affiliate kits.
// Zone determines which kits a visitor sees on /shop and /shop/kits.

export type KitZone = "AU" | "UK_IE" | "NORTH_AM" | "EU_MENA";

export const ZONE_COUNTRIES: Record<KitZone, string[]> = {
  AU: ["AU"],
  UK_IE: ["GB", "IE"],
  NORTH_AM: ["US", "CA"],
  EU_MENA: ["DE", "FR", "NL", "SE", "BE", "AE"],
};

export const ZONE_LABEL: Record<KitZone, string> = {
  AU: "Australia",
  UK_IE: "UK & Ireland",
  NORTH_AM: "North America",
  EU_MENA: "Europe & Middle East",
};

export const ZONE_SHIPS_FROM: Record<KitZone, string> = {
  AU: "Ships from Australia (AUD)",
  UK_IE: "Ships from the UK (GBP)",
  NORTH_AM: "Ships internationally from the UK (GBP)",
  EU_MENA: "Ships internationally from the UK (GBP)",
};

export function zoneForCountry(code: string | null | undefined): KitZone {
  if (!code) return "UK_IE";
  const c = code.toUpperCase();
  for (const z of Object.keys(ZONE_COUNTRIES) as KitZone[]) {
    if (ZONE_COUNTRIES[z].includes(c)) return z;
  }
  return "UK_IE";
}

export function countriesInZone(z: KitZone): string[] {
  return ZONE_COUNTRIES[z];
}

const CURRENCY_SYMBOL: Record<string, string> = {
  AUD: "A$",
  GBP: "£",
  USD: "US$",
  EUR: "€",
  CAD: "C$",
};

export function formatPrice(price: number | null, currency: string | null): string {
  if (price == null || !currency) return "";
  const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return `${sym}${price.toFixed(2)}`;
}
