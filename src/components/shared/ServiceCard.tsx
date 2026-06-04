// Shared ServiceCard — standardized card for HELP Network services.
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface ServiceCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  routeType?: string; // reserved for future route_disclosures lookup
}

export function ServiceCard({ title, description, icon, href, onClick }: ServiceCardProps) {
  const content = (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-accent transition-colors text-left w-full">
      {icon && <div className="shrink-0 mt-0.5 text-primary">{icon}</div>}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}

export default ServiceCard;
