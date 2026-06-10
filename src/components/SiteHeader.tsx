import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import DonateMenu from "@/components/DonateMenu";
import ShopMenu from "@/components/ShopMenu";
import LearnMenu from "@/components/LearnMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import aidAngelLogo from "@/assets/aidangel-logo.png";

interface SiteHeaderProps {
  backTo?: string;
  backLabel?: string;
  showBackButton?: boolean;
}

export default function SiteHeader({ backTo, backLabel, showBackButton = true }: SiteHeaderProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fallbackBackTo = backTo ?? "/";

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
      <div className="max-w-6xl mx-auto mt-3 flex flex-wrap items-center justify-center gap-2">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={backLabel ? `Go back to ${backLabel}` : "Go back"}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <DonateMenu variant="header" />
        <ShopMenu variant="header" />
        <LearnMenu variant="header" />
      </div>
    </header>
  );
}
