// In-house shop landing page. Features vendor cards + carousels for Love Key
// and St John, replacing the old flat product grid.

import { useEffect, useState } from "react";
import NetworkFooter from "@/components/NetworkFooter";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { KitCarousel } from "@/components/kits/KitCarousel";
import LoveKeyGuardianCard from "@/components/shop/LoveKeyGuardianCard";
import { VendorCard } from "@/components/shop/VendorCard";
import stJohnIcon from "@/assets/stjohn-icon.png";

// Love Key logo — use the blue Guardian keyring from Shopify CDN until a
// dedicated logo asset is added.
const LOVEKEY_LOGO = "https://lovekey.com.au/assets/heart-logo-CHHfs6fW.png";

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(24)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>First Aid Angel Shop</title>
        <meta
          name="description"
          content="Shop recommended first aid products from Love Key and St John — keyrings, kits and supplies curated for your region."
        />
      </Helmet>

      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> First Aid Angel
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">First Aid Angel Shop</h1>
            <p className="text-xs text-muted-foreground">Recommended Products</p>
          </div>
          <CartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">

        {/* Vendor cards */}
        <section aria-label="Our partners" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VendorCard
            logo={LOVEKEY_LOGO}
            logoAlt="Love Key"
            name="Love Key"
            badge="NFC & QR enabled keyring"
            description="A beautifully crafted metal keyring that keeps your emergency contacts and medical information one tap away. NFC enabled and QR coded — your personal safety profile, always on your keys."
            ctaLabel="Shop Love Key"
            ctaHref="https://lovekey.com.au/#product-section"
          />
          <VendorCard
            logo={stJohnIcon}
            logoAlt="St John First Aid"
            name="St John First Aid"
            badge="Ships in Australia"
            description="Official St John Ambulance first aid shop — workplace-compliant kits, refills, defibrillators, and training supplies trusted by schools, businesses, and families."
            ctaLabel="Shop St John First Aid"
            ctaHref="https://www.stjohnwa.com.au/first-aid-supplies"
          />
        </section>

        {/* Love Key Guardian colour carousel */}
        <section aria-labelledby="lovekey-heading">
          <h2 id="lovekey-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-4">
            Love Key Guardian
          </h2>
          <LoveKeyGuardianCard />
        </section>

        {/* St John regional kit carousel */}
        <section aria-labelledby="stjohn-carousel-heading">
          <KitCarousel heading="St John First Aid Kits" />
        </section>

        {/* St John full product grid */}
        <section aria-labelledby="store-heading">
          <h2 id="store-heading" className="text-xl sm:text-2xl font-bold text-foreground mb-4">
            St John First Aid Store
          </h2>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-center text-destructive py-16">Failed to load products: {error}</p>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm">
                Our store is empty right now — browse the regional kits above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <NetworkFooter />
    </div>
  );
}
