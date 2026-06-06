import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, MessageCircle, BookOpen, Search, HeartPulse, MapPin, FileText, GraduationCap, HandHeart, ShoppingBag, School, Info, Briefcase } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";

interface NavItem {
  labelKey: TranslationKey;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "navChat", href: "/", icon: MessageCircle },
  { labelKey: "navKnowledgeBase", href: "/kb", icon: BookOpen },
  { labelKey: "navSymptomFinder", href: "/symptoms", icon: Search },
  { labelKey: "navCprGuide", href: "/cpr", icon: HeartPulse },
  { labelKey: "navAedFinder", href: "/aed-finder", icon: MapPin },
  { labelKey: "navWorkplaceFirstAid", href: "/workplace", icon: Briefcase },
  { labelKey: "navAngelActionPdfs", href: "/angel-action", icon: FileText },
  { labelKey: "navFirstAidTraining", href: "/personal", icon: GraduationCap },
  { labelKey: "navEducationPartners", href: "/learn", icon: School },
  { labelKey: "navDonationPartners", href: "/partners", icon: HandHeart },
  { labelKey: "navFirstAidKitShop", href: "/shop", icon: ShoppingBag },
  { labelKey: "navAbout", href: "/about", icon: Info },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={t("menuOpen")}
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 sm:w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="text-left font-display font-bold text-xl">
              {t("menuTitle")}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted hover:text-primary"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                        <span>{t(item.labelKey)}</span>
                        {active && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                        )}
                      </Link>
                    </SheetClose>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              {t("menuFooter")}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
