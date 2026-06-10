import { Link, useLocation } from "react-router-dom";
import { LANGS } from "@/lib/i18n";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  aed: "AED Finder",
  "aed-finder": "AED Finder",
  "angel-action": "Angel Action",
  auth: "Sign In",
  blog: "Blog",
  cpr: "CPR Guide",
  courses: "Courses",
  "medical-disclaimer": "Medical Disclaimer",
  kb: "First Aid Library",
  learn: "Learn First Aid",
  "my-learning": "My Learning",
  "my-location": "My Location",
  personal: "First Aid Training",
  product: "Product",
  programs: "Programs",
  provider: "Provider",
  reset: "Reset",
  "reset-password": "Reset Password",
  refund: "Refund Policy",
  shop: "Shop",
  store: "Shop",
  symptoms: "Symptom Finder",
  terms: "Terms",
  topics: "First Aid Topics",
  workplace: "Workplace First Aid",
};

const ACRONYMS = new Set(["aed", "api", "cpr", "cms", "drsabcd", "kb", "lms", "pdf", "pdfs", "seo"]);

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function titleizeSegment(segment: string) {
  const decoded = decodeSegment(segment);
  const key = decoded.toLowerCase();
  if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key];

  return decoded
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

export function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const rawSegments = pathname.split("/").filter(Boolean);
  const hasLanguagePrefix = rawSegments.length > 0 && (LANGS as readonly string[]).includes(rawSegments[0]);
  const languagePrefix = hasLanguagePrefix ? `/${rawSegments[0]}` : "";
  const displaySegments = hasLanguagePrefix ? rawSegments.slice(1) : rawSegments;
  const homeHref = languagePrefix || "/";

  return [
    { label: "Home", href: homeHref },
    ...displaySegments.map((segment, index) => ({
      label: titleizeSegment(segment),
      href: `${languagePrefix}/${displaySegments.slice(0, index + 1).join("/")}`,
    })),
  ];
}

interface PageBreadcrumbsProps {
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export default function PageBreadcrumbs({ breadcrumbs, className = "" }: PageBreadcrumbsProps) {
  const location = useLocation();
  const breadcrumbItems = breadcrumbs ?? buildBreadcrumbs(location.pathname);

  if (location.pathname === "/" || breadcrumbItems.length <= 1) return null;

  return (
    <div className={`bg-background px-4 pt-4 ${className}`}>
      <nav aria-label="Breadcrumb" className="site-page-breadcrumb max-w-[820px] mx-auto min-w-0">
        <ol className="flex flex-wrap items-center justify-start gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
          {breadcrumbItems.map((crumb, index) => {
            const current = index === breadcrumbItems.length - 1;
            return (
              <li key={`${crumb.href ?? crumb.label}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
                {index > 0 && <span aria-hidden="true" className="text-muted-foreground/60">/</span>}
                {current || !crumb.href ? (
                  <span aria-current={current ? "page" : undefined} className="truncate font-medium text-muted-foreground">
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.href} className="truncate text-muted-foreground hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
