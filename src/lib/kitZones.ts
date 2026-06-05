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

// The currency a visitor will actually be charged is determined by the host
// shop, not by the visitor's country (e.g. a French shopper checking out on
// shop.sja.org.uk pays in GBP). Use this to override stored `currency` when a
// destination_url is known.
const HOST_CURRENCY: Record<string, string> = {
  "shop.stjohn.org.au": "AUD",
  "shop.sja.org.uk": "GBP",
};

export function currencyForHost(destinationUrl: string | null | undefined): string | null {
  if (!destinationUrl) return null;
  try {
    return HOST_CURRENCY[new URL(destinationUrl).hostname] ?? null;
  } catch {
    return null;
  }
}

export function formatPrice(
  price: number | null,
  currency: string | null,
  destinationUrl?: string | null,
): string {
  if (price == null) return "";
  const resolved = currencyForHost(destinationUrl) ?? currency;
  if (!resolved) return "";
  const sym = CURRENCY_SYMBOL[resolved] ?? `${resolved} `;
  return `${sym}${price.toFixed(2)}`;
}
