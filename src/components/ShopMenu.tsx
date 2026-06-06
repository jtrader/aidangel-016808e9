// Header/footer "Shop" pill. Navigates directly to the in-house shop page
// (/shop) where the visitor sees a regional kit carousel and our store grid.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateStrings } from "@/lib/uiTranslate";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KitCarousel } from "@/components/kits/KitCarousel";
import { trackShopClick } from "@/lib/giveAnalytics";
import { fetchProducts } from "@/lib/shopify";
import { useCountry } from "@/hooks/useCountry";

interface ShopMenuProps {
  variant?: "header" | "footer";
}

export default function ShopMenu({ variant = "footer" }: ShopMenuProps) {
  const { language } = useLanguage();
  const { country } = useCountry();
  const [label, setLabel] = useState("Shop");
  const [prefetching, setPrefetching] = useState(false);
  const [prefetched, setPrefetched] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (language === "en") {
      setLabel("Shop");
      return;
    }
    let cancelled = false;
    translateStrings(language, ["Shop"]).then((s) => {
      if (!cancelled) setLabel(s[0] ?? "Shop");
    });
    return () => { cancelled = true; };
  }, [language]);

  const classes = variant === "header"
    ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    : "inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors";

  const handleOpen = async () => {
    setOpen(true);
    // analytics: record a shop dialog open with real country/language
    try {
      trackShopClick({
        ngoId: "faa-store",
        countryCode: country?.code ?? "",
        countryName: country?.name ?? "",
        destinationUrl: "/store",
        isNational: false,
        language: language ?? "en",
        variant: "footer",
      });
    } catch {}

    if (prefetched) return;
    setPrefetching(true);
    try {
      // prefetch a few products for faster UX in the dialog and warm images
      const products = await fetchProducts(6);
      for (const p of products) {
        const url = p.node.images?.edges?.[0]?.node?.url;
        if (url) {
          const img = new Image();
          img.src = url;
        }
      }
      // pre-import the cart drawer module so the cart UI is cached
      void import("@/components/shop/CartDrawer");
      setPrefetched(true);
    } catch (e) {
      // ignore prefetch errors
      // eslint-disable-next-line no-console
      console.warn("prefetch products failed", e);
    } finally {
      setPrefetching(false);
    }
  };

  const handleCtaClick = () => {
    try {
      trackShopClick({
        ngoId: "faa-store",
        countryCode: country?.code ?? "",
        countryName: country?.name ?? "",
        destinationUrl: "/store",
        isNational: false,
        language: language ?? "en",
        variant: "dialog_cta",
      });
    } catch {}
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" onClick={handleOpen} className={classes} aria-label={label} data-analytics-event="shop_pill_click">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {/* limit carousel on mobile by relying on KitCarousel's limit prop; autoplay when dialog open */}
          <KitCarousel limit={6} autoplay={open} />
        </div>
        <div className="mt-4 flex justify-end">
          <Link to="/store" onClick={handleCtaClick} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            Open full store
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
