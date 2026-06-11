// Audience-routing seam for the Shop dialogue.
// Today: renders both partner product lines.
// Tomorrow: a marketing/audience layer will swap this surface
// (different kits, country bundles, donation upsell, banners…)
// via a hook like `useAudienceVariant("shop_dialog")`.
// Keep ShopMenu dumb — all variant logic belongs HERE.

import { KitCarousel } from "@/components/kits/KitCarousel";
import type { LanguageCode } from "@/contexts/LanguageContext";

export type ShopDialogSurface = "shop_dialog";

interface ShopDialogContentProps {
  surface: ShopDialogSurface;
  country: { code?: string; name?: string } | null | undefined;
  language: LanguageCode;
  autoplay?: boolean;
}

export function ShopDialogContent({ country, autoplay = true }: ShopDialogContentProps) {
  const countryCode = country?.code;

  return (
    <>
      <div className="mb-5">
        <h2 className="font-display font-bold text-xl text-foreground">First Aid Angel Shop</h2>
        <p className="text-sm text-muted-foreground">Recommended Products</p>
      </div>

      <div className="space-y-8">
        <section aria-labelledby="lovekey-products-heading">
          <div className="mb-3">
            <h3 id="lovekey-products-heading" className="text-base sm:text-lg font-semibold text-foreground">
              Love Key Guardian
            </h3>
            <p className="text-xs text-muted-foreground">
              NFC and QR emergency profile keyrings for everyday carry.
            </p>
          </div>
          <KitCarousel
            countryCode={countryCode}
            limit={8}
            autoplay={autoplay}
            compact
            heading=""
            vendor="Love Key"
          />
        </section>

        <section aria-labelledby="stjohn-products-heading">
          <div className="mb-3">
            <h3 id="stjohn-products-heading" className="text-base sm:text-lg font-semibold text-foreground">
              St John First Aid
            </h3>
            <p className="text-xs text-muted-foreground">
              First aid kits, refills, defibrillators, and safety supplies.
            </p>
          </div>
          <KitCarousel
            countryCode={countryCode}
            limit={6}
            autoplay={autoplay}
            compact
            heading=""
            vendor="St John"
          />
        </section>
      </div>
    </>
  );
}
