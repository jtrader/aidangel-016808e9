import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountry } from "@/hooks/useCountry";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { citySlug } from "@/lib/educators";
import { getCountry } from "@/lib/donations";
import { useLanguage } from "@/contexts/LanguageContext";

interface LearnMenuProps {
  variant?: "header" | "footer";
}

const interpolate = (s: string, vars: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

export default function LearnMenu({ variant = "header" }: LearnMenuProps) {
  const { country } = useCountry();
  const { geo } = useGeoLocation();
  const { t } = useLanguage();

  // Prefer detected city/country when available
  const effectiveCountry = (geo?.country && getCountry(geo.country)) || country;
  const cc = effectiveCountry.code.toLowerCase();
  const href = geo?.city
    ? `/learn/${cc}/${citySlug(geo.city)}`
    : `/learn/${cc}`;

  const classes =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors";

  const label = geo?.city ?? effectiveCountry.name;
  const title = geo?.city
    ? interpolate(t("learnMenuCoursesNear"), { city: geo.city })
    : interpolate(t("learnMenuCoursesIn"), { country: effectiveCountry.name });

  return (
    <Link
      to={href}
      className={classes}
      aria-label={interpolate(t("learnMenuAriaLabel"), { location: label })}
      title={title}
    >
      <GraduationCap className="h-4 w-4" aria-hidden="true" />
      <span className="sm:hidden">{t("learnMenuShort")}</span>
      <span className="hidden sm:inline truncate max-w-[140px]">
        {t("learnMenuFull")}
      </span>
    </Link>
  );
}

