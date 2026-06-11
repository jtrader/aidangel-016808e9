import { ExternalLink, CheckCircle, ShoppingBag } from "lucide-react";

interface VendorCardProps {
  logo: string;
  logoAlt: string;
  name: string;
  badge: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export function VendorCard({ logo, logoAlt, name, badge, description, ctaLabel, ctaHref }: VendorCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img src={logo} alt={logoAlt} className="w-12 h-12 rounded-xl object-contain bg-muted/40 border border-border p-1 shrink-0" />
        <div>
          <p className="font-bold text-base text-foreground leading-tight">{name}</p>
          <p className="flex items-center gap-1 text-xs text-primary mt-0.5">
            <CheckCircle className="h-3 w-3" /> {badge}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <ShoppingBag className="h-4 w-4" />
        {ctaLabel}
        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      </a>
    </div>
  );
}
