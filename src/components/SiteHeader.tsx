import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import DonateMenu from "@/components/DonateMenu";
import ShopMenu from "@/components/ShopMenu";
import LearnMenu from "@/components/LearnMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGS } from "@/lib/i18n";
import aidAngelLogo from "@/assets/aidangel-logo.png";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SiteHeaderProps {
  backTo?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
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

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
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

export default function SiteHeader({
  backTo,
  backLabel,
  breadcrumbs,
  showBreadcrumbs = true,
}: SiteHeaderProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbItems = breadcrumbs ?? buildBreadcrumbs(location.pathname);
  const shouldShowBreadcrumbs = showBreadcrumbs && location.pathname !== "/" && breadcrumbItems.length > 1;
  const parentCrumb = breadcrumbItems.length > 1 ? breadcrumbItems[breadcrumbItems.length - 2] : breadcrumbItems[0];
  const fallbackBackTo = backTo ?? parentCrumb?.href ?? "/";

  const handleBack = () => {
    const hasInAppHistory =
      typeof window !== "undefined" &&
      typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0;

    if (hasInAppHistory) {
      navigate(-1);
      return;
    }

    navigate(fallbackBackTo);
  };

  return (
    <header className="border-b border-border bg-card px-4 py-4">
      <div className="max-w-6xl mx-auto flex flex-row items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={aidAngelLogo}
              alt="First Aid Angel logo"
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-foreground leading-tight truncate">
                  First Aid Angel
                </h1>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {t("appSubtitle")}
              </p>
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-end flex-shrink-0">
          <HamburgerMenu />
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-3 flex items-center justify-center gap-2">
        <DonateMenu variant="header" />
        <ShopMenu variant="header" />
        <LearnMenu variant="header" />
      </div>
      {shouldShowBreadcrumbs && (
        <div className="max-w-6xl mx-auto mt-3 flex items-center justify-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={backLabel ? `Go back to ${backLabel}` : "Go back"}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
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
      )}
    </header>
  );
}
