// Love Key Guardian referral card.
// Shows the Guardian colour range from the Shopify "love-key-guardian"
// collection and refers the visitor to lovekey.com.au to purchase —
// same external-checkout pattern as the partner first aid kits.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, KeyRound } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, SHOPIFY_CONFIGURED, type ShopifyProduct } from "@/lib/shopify";

const LOVEKEY_URL = "https://lovekey.com.au";
const LOVEKEY_PRODUCT_URL = "https://lovekey.com.au/?variant=metal&color={color}#product-section";
const COLLECTION_HANDLE = "love-key-guardian";

function colourUrl(colour: string): string {
  return LOVEKEY_PRODUCT_URL.replace("{color}", encodeURIComponent(colour.toLowerCase().replace(/\s+/g, "-")));
}

const DESCRIPTION =
  "Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.";

interface Props {
  className?: string;
  /** Compact renders a single-row card suited to KB/article sidebars. */
  compact?: boolean;
}

let cached: Promise<ShopifyProduct[]> | null = null;
function fetchGuardians(): Promise<ShopifyProduct[]> {
  if (!cached) {
    cached = (async () => {
      const res = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(
        PRODUCTS_QUERY,
        { first: 10, query: `collection:${COLLECTION_HANDLE}` },
      );
      return res?.data?.products?.edges ?? [];
    })();
  }
  return cached;
}

export default function LoveKeyGuardianCard({ className, compact }: Props) {
  const [guardians, setGuardians] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    if (!SHOPIFY_CONFIGURED) return;
    let cancelled = false;
    fetchGuardians()
      .then((p) => { if (!cancelled) setGuardians(p); })
      .catch(() => { /* static fallback below still renders */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <Card className={"p-6 rounded-2xl " + (className ?? "")}>
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
        <KeyRound className="h-4 w-4 text-primary" /> Love Key Guardian
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{DESCRIPTION}</p>

      {guardians.length > 0 && (
        <div className={"mt-4 grid gap-2 " + (compact ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-8")}>
          {guardians.map(({ node }) => {
            const img = node.images?.edges?.[0]?.node;
            const colour = node.title.replace(/^Love Key Guardian\s*-\s*/i, "");
            return (
              <a
                key={node.id}
                href={colourUrl(colour)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                title={`Love Key Guardian — ${colour}`}
                className="group flex flex-col items-center gap-1"
              >
                {img ? (
                  <img
                    src={img.url}
                    alt={img.altText ?? node.title}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-contain bg-muted/40 border border-border group-hover:border-primary transition-colors"
                  />
                ) : (
                  <span className="w-14 h-14 rounded-lg bg-muted border border-border" />
                )}
                <span className="text-[10px] text-muted-foreground group-hover:text-primary leading-tight text-center">
                  {colour}
                </span>
              </a>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Button asChild size="sm">
          <a href={LOVEKEY_URL} target="_blank" rel="noopener noreferrer sponsored">
            Buy from Love Key <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
