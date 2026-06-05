import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { countriesInZone, type KitZone } from "@/lib/kitZones";

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
}

export function useKitsForZone(zone: KitZone, opts?: { limit?: number; preferCountry?: string }) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const countries = countriesInZone(zone);
    supabase
      .from("route_catalogue")
      .select(
        "id, route_slug, title, description, image_url, destination_url, country, price, currency",
      )
      .eq("partner_entity", "stjohn")
      .eq("route_type", "kit")
      .eq("availability_status", "available")
      .in("country", countries)
      .then(({ data }) => {
        if (cancelled || !data) return;
        // Dedupe by title — prefer exact country match, then any.
        const byTitle = new Map<string, Kit>();
        const preferred = opts?.preferCountry?.toUpperCase();
        for (const row of data as Kit[]) {
          const existing = byTitle.get(row.title);
          if (!existing) {
            byTitle.set(row.title, row);
          } else if (preferred && row.country === preferred && existing.country !== preferred) {
            byTitle.set(row.title, row);
          }
        }
        let result = Array.from(byTitle.values()).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        if (opts?.limit) result = result.slice(0, opts.limit);
        setKits(result);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zone, opts?.limit, opts?.preferCountry]);

  return { kits, loading };
}
