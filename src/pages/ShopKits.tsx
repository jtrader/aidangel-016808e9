import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShoppingBag } from "lucide-react";
import { useCountry } from "@/hooks/useCountry";
import { KitGrid } from "@/components/kits/KitGrid";
import { ZONE_LABEL, ZONE_SHIPS_FROM, zoneForCountry, type KitZone } from "@/lib/kitZones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NetworkFooter from "@/components/NetworkFooter";

const ZONES: KitZone[] = ["AU", "UK_IE", "NORTH_AM", "EU_MENA"];

export default function ShopKits() {
  const { country } = useCountry();
  const defaultZone = useMemo(() => zoneForCountry(country.code), [country.code]);
  const [zone, setZone] = useState<KitZone>(defaultZone);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>St John First Aid Kits — Shop by region · First Aid Angel</title>
        <meta
          name="description"
          content={`Official St John Ambulance first aid kits with regional pricing for ${ZONE_LABEL[zone]}.`}
        />
        <link rel="canonical" href="https://firstaidangel.org/shop/kits" />
      </Helmet>

      <SiteHeader backTo="/shop" backLabel="Shop" />

      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-sm">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              St John First Aid Kits
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Workplace-compliant kits, home essentials and travel pouches from St John Ambulance —
              priced and shipped for your region.
            </p>
          </div>

          <div className="mb-8 bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Showing kits for {ZONE_LABEL[zone]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{ZONE_SHIPS_FROM[zone]}</p>
            </div>
            <div className="sm:w-64">
              <Select value={zone} onValueChange={(v) => setZone(v as KitZone)}>
                <SelectTrigger aria-label="Change region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {ZONES.map((z) => (
                    <SelectItem key={z} value={z}>
                      {ZONE_LABEL[z]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <KitGrid zone={zone} preferCountry={country.code} />

          <p className="mt-10 text-xs text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
            First Aid Angel is independent and not affiliated with St John Ambulance. Outbound links
            include tracking parameters so we can measure which kits visitors choose.
          </p>
        </div>
      </main>

      <NetworkFooter />
    </div>
  );
}
