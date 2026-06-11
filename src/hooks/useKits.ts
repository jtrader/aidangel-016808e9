import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { countriesInZone, type KitZone } from "@/lib/kitZones";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";

export interface Kit {
  id: string;
  route_slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  destination_url: string | null;
  country: string | null;
  price: number | null;
  currency: string | null;
  vendor: string | null;
  cta_label: string | null;
  shopify_handle?: string | null;
  shopify_tags?: string[];
  shopify_zone_tags?: string[];
}

// Normalize a kit title so Shopify product master data can be matched
// to per-country route_catalogue rows (must mirror the rule used when the
// Shopify products were created).
function normalizeTitle(t: string): string {
  return t
    .replace(/\s*BS[-\s]?8599[-\s]?1[:\-]?2019\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function titleToHandle(t: string): string {
  return normalizeTitle(t)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeVendor(vendor: string | null | undefined): string {
  return (vendor ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function matchesVendor(rowVendor: string | null | undefined, vendorFilter: string): boolean {
  const normalizedRowVendor = normalizeVendor(rowVendor);
  const normalizedVendorFilter = normalizeVendor(vendorFilter);
  return normalizedVendorFilter.length > 0 && normalizedRowVendor.includes(normalizedVendorFilter);
}

function isLoveKeyVendor(vendor: string | null | undefined): boolean {
  return normalizeVendor(vendor).includes("lovekey");
}

// Love Key audiences are tagged on Shopify by locale. The site country selector
// uses ISO country codes, so map that locale to the matching Shopify zone tag.
// GB visitors are the UK audience, so the primary tag is zone-UK; zone-GB is
// accepted as a defensive alias if products were tagged that way later.
const LOVE_KEY_ZONE_TAGS_BY_COUNTRY: Record<string, string[]> = {
  AU: ["zone-AU"],
  CA: ["zone-CA"],
  GB: ["zone-UK", "zone-GB"],
  NZ: ["zone-NZ"],
  US: ["zone-US"],
};

const LOVE_KEY_CURRENCY_BY_COUNTRY: Record<string, string> = {
  AU: "AUD",
  CA: "CAD",
  GB: "GBP",
  NZ: "NZD",
  US: "USD",
};

function loveKeyZoneTagsForCountry(code: string | null | undefined): string[] {
  return LOVE_KEY_ZONE_TAGS_BY_COUNTRY[(code ?? "").toUpperCase()] ?? [];
}

function productHasAnyTag(product: ShopifyProduct["node"] | undefined, tags: string[]): boolean {
  if (!product || tags.length === 0) return false;
  const productTags = new Set((product.tags ?? []).map((t) => t.toLowerCase()));
  return tags.some((tag) => productTags.has(tag.toLowerCase()));
}

function productZoneTags(product: ShopifyProduct["node"] | undefined): string[] | undefined {
  const tags = product?.tags?.filter((tag) => /^zone-/i.test(tag));
  return tags && tags.length > 0 ? tags : undefined;
}

function uniqueCountries(countries: string[]): string[] {
  return Array.from(new Set(countries.map((c) => c.toUpperCase())));
}

function localizeLoveKeyUrl(destinationUrl: string | null, countryCode: string): string | null {
  if (!destinationUrl) return null;
  try {
    const url = new URL(destinationUrl);
    url.searchParams.set("locale", countryCode);
    return url.toString();
  } catch {
    return destinationUrl;
  }
}

function localizeLoveKeyRow(row: Kit, preferredCountry: string | undefined, isLoveKeyAudience: boolean): Kit {
  if (!isLoveKeyAudience || !preferredCountry || !isLoveKeyVendor(row.vendor)) return row;
  const country = preferredCountry.toUpperCase();
  return {
    ...row,
    country,
    currency: LOVE_KEY_CURRENCY_BY_COUNTRY[country] ?? row.currency,
    destination_url: localizeLoveKeyUrl(row.destination_url, country),
  };
}

// Cache Shopify product master data per zone/query for the session.
const shopifyCache = new Map<string, Promise<Map<string, ShopifyProduct["node"]>>>();

// Zone → Shopify smart collection handle (created via
// scripts/shopify-create-kit-zone-collections.ts). Curating membership in
// Shopify admin (collection rules) is now the source of truth for which kits
// appear per region — replaces the previous `tag:faa-affiliate-kit AND tag:zone-*`
// filter.
const ZONE_COLLECTION_HANDLE: Record<KitZone, string> = {
  AU: "kits-au",
  UK_IE: "kits-uk-ie",
  NORTH_AM: "kits-north-am",
  EU_MENA: "kits-eu-mena",
};

function fetchShopifyMastersForZone(zone: KitZone, opts?: { vendor?: string; preferCountry?: string }) {
  const loveKeyTags = isLoveKeyVendor(opts?.vendor) ? loveKeyZoneTagsForCountry(opts?.preferCountry) : [];
  const query = loveKeyTags.length > 0 ? `tag:${loveKeyTags[0]}` : `collection:${ZONE_COLLECTION_HANDLE[zone]}`;
  const cacheKey = `${zone}:${query}`;
  let p = shopifyCache.get(cacheKey);
  if (!p) {
    p = (async () => {
      const res = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(
        PRODUCTS_QUERY,
        { first: 50, query },
      );
      const map = new Map<string, ShopifyProduct["node"]>();
      for (const edge of res?.data?.products?.edges ?? []) {
        map.set(edge.node.handle, edge.node);
      }
      return map;
    })();
    shopifyCache.set(cacheKey, p);
  }
  return p;
}

export function useKitsForZone(
  zone: KitZone,
  opts?: { limit?: number; preferCountry?: string; vendor?: string },
) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const preferred = opts?.preferCountry?.toUpperCase();
    const loveKeyTags = isLoveKeyVendor(opts?.vendor) ? loveKeyZoneTagsForCountry(preferred) : [];
    const isLoveKeyAudience = loveKeyTags.length > 0;
    const countries = isLoveKeyAudience && preferred
      // Production may only have the AU Love Key catalogue rows; include AU as
      // a base catalogue fallback, then localize those rows to the selected locale.
      ? uniqueCountries([preferred, "AU"])
      : countriesInZone(zone);

    (async () => {
      try {
        const [routesRes, shopifyMap] = await Promise.all([
          supabase
            .from("route_catalogue")
            .select(
              "id, route_slug, title, description, image_url, destination_url, country, price, currency, vendor, cta_label",
            )
            // Exclude rows explicitly marked unavailable; allow null/unknown to surface.
            .neq("availability_status", "unavailable")
            .in("country", countries),
          fetchShopifyMastersForZone(zone, opts),
        ]);

        if (cancelled) return;
        const data = (routesRes as any)?.data as Kit[] | null;
        if (!data) {
          setKits([]);
          setLoading(false);
          return;
        }

        const rows = opts?.vendor
          ? data.filter((row) => matchesVendor(row.vendor, opts.vendor!))
          : data;

        // Dedupe by Shopify handle — prefer exact country match, then any base row.
        const byHandle = new Map<string, Kit>();
        for (const row of rows) {
          const handle = titleToHandle(row.title);
          const shop = (await shopifyMap)?.get(handle);
          // Verify the Shopify zone when master data is available. Do not hide
          // route_catalogue rows solely because Shopify master lookup failed;
          // the country/AU row is the display fallback.
          if (isLoveKeyAudience && shop && !productHasAnyTag(shop, loveKeyTags)) continue;
          // Merge: Shopify owns title/image/description; route_catalogue owns price + affiliate URL.
          const merged: Kit = localizeLoveKeyRow({
            ...row,
            title: shop?.title ?? row.title,
            description: shop?.description ?? row.description,
            image_url: shop?.images?.edges?.[0]?.node?.url ?? row.image_url,
            shopify_handle: shop?.handle ?? null,
            shopify_tags: shop?.tags ?? undefined,
            shopify_zone_tags: productZoneTags(shop) ?? (isLoveKeyAudience ? loveKeyTags : undefined),
          }, preferred, isLoveKeyAudience);
          const existing = byHandle.get(handle);
          if (!existing) {
            byHandle.set(handle, merged);
          } else if (preferred && row.country === preferred && existing.country !== preferred) {
            byHandle.set(handle, merged);
          }
        }
        let result = Array.from(byHandle.values()).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        if (opts?.limit) result = result.slice(0, opts.limit);
        setKits(result);
      } catch (e: any) {
        setError(e?.message ?? String(e));
        setKits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zone, opts?.limit, opts?.preferCountry, opts?.vendor]);

  return { kits, loading, error };
}
