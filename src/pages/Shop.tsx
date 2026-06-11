// Shopify-powered store for paid personal and employee first aid packages.

import { useEffect, useState } from "react";
import NetworkFooter from "@/components/NetworkFooter";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartDrawer } from "@/components/shop/CartDrawer";

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(24, "vendor:FirstAidAngel")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>First Aid Angel Store</title>
        <meta
          name="description"
          content="Personal and employee first aid packages from First Aid Angel."
        />
      </Helmet>

      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> First Aid Angel
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">First Aid Angel Store</h1>
            <p className="text-xs text-muted-foreground">Personal &amp; Employee Packages</p>
          </div>
          <CartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-16">Failed to load products: {error}</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <NetworkFooter />
    </div>
  );
}
