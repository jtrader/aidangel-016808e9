import { ExternalLink } from "lucide-react";
import { formatPrice, type KitZone } from "@/lib/kitZones";
import type { Kit } from "@/hooks/useKits";

const LOVE_KEY_SHIPS_FROM_LABEL = "Ships from Australia (AUD)";

function isLoveKeyGuardianKit(kit: Kit): boolean {
  const vendor = (kit.vendor ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  return vendor.includes("lovekey") || /love\s*key\s*guardian/i.test(kit.title);
}

function formatLoveKeyPrice(price: number | null): string {
  if (price == null) return "";
  return `$${price.toFixed(2)}`;
}

function buttonTextForKit(kit: Kit, isLoveKeyGuardian: boolean): string {
  if (isLoveKeyGuardian) {
    return (kit.cta_label ?? "Buy at Love Key").replace(/^Buy from\b/i, "Buy at");
  }
  return kit.cta_label ?? (kit.vendor ? `Buy at ${kit.vendor}` : "Buy now");
}

export function KitCard({
  kit,
  zone,
  shipsFromLabel,
}: {
  kit: Kit;
  zone?: KitZone;
  shipsFromLabel?: string;
}) {
  const isLoveKeyGuardian = isLoveKeyGuardianKit(kit);
  const visibleZoneTags = isLoveKeyGuardian ? [] : (kit.shopify_zone_tags ?? []);
  const effectiveShipsFromLabel = isLoveKeyGuardian ? LOVE_KEY_SHIPS_FROM_LABEL : shipsFromLabel;
  const priceText = isLoveKeyGuardian
    ? formatLoveKeyPrice(kit.price)
    : formatPrice(kit.price, kit.currency, kit.destination_url);
  const buttonText = buttonTextForKit(kit, isLoveKeyGuardian);

  const params = new URLSearchParams();
  params.set(
    "src",
    typeof window !== "undefined" ? window.location.pathname : "",
  );
  if (zone) params.set("zone", zone);
  if (kit.country) params.set("country", kit.country);
  if (kit.shopify_handle) params.set("handle", kit.shopify_handle);
  const href = `/go/${encodeURIComponent(kit.route_slug)}?${params.toString()}`;

  return (
    <article className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <a href={href} target="_blank" rel="noopener sponsored" className="block aspect-square bg-muted overflow-hidden">
        {kit.image_url ? (
          <img
            src={kit.image_url}
            alt={kit.title}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </a>
      <div className="p-4 flex flex-col flex-1 gap-2">
        {visibleZoneTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleZoneTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
          {kit.title}
        </h3>
        <p className="text-lg font-bold text-foreground">
          {priceText}
        </p>
        {effectiveShipsFromLabel && (
          <p className="text-[11px] text-muted-foreground">{effectiveShipsFromLabel}</p>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener sponsored"
          className="mt-auto inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {buttonText}
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>
    </article>
  );
}
