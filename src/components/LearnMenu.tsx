// Header/footer "Learn" pill. On tap, opens a responsive Learn dialogue:
// - mobile (< 768px): bottom sheet via vaul Drawer
// - tablet/desktop (>= 768px): centered Dialog
// The body renders <LearnDialogContent />, a cycling carousel of the
// 5 First Aid Angel courses sourced from firstaidangel.org/programs.

import { useState } from "react";
import { GraduationCap, X } from "lucide-react";
import { useCountry } from "@/hooks/useCountry";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { getCountry } from "@/lib/donations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { LearnDialogContent } from "@/components/learn/LearnDialogContent";

interface LearnMenuProps {
  variant?: "header" | "footer";
}

const interpolate = (s: string, vars: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

export default function LearnMenu({ variant = "header" }: LearnMenuProps) {
  const { country } = useCountry();
  const { geo } = useGeoLocation();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const effectiveCountry = (geo?.country && getCountry(geo.country)) || country;
  const locationLabel = geo?.city ?? effectiveCountry.name;
  const title = geo?.city
    ? interpolate(t("learnMenuCoursesNear"), { city: geo.city })
    : interpolate(t("learnMenuCoursesIn"), { country: effectiveCountry.name });

  const triggerClasses =
    variant === "header"
      ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
      : "inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors";

  const Trigger = (
    <button
      type="button"
      className={triggerClasses}
      aria-label={interpolate(t("learnMenuAriaLabel"), { location: locationLabel })}
      title={title}
      data-analytics-event="learn_pill_click"
    >
      <GraduationCap className="h-4 w-4" aria-hidden="true" />
      <span className="sm:hidden">{t("learnMenuShort")}</span>
      <span className="hidden sm:inline truncate max-w-[140px]">
        {t("learnMenuFull")}
      </span>
    </button>
  );

  const Body = (
    <>
      <LearnDialogContent autoplay={open} />
      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
        >
          {t("shopDialogClose")}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
        <DrawerContent
          className="max-h-[90vh] bg-card border-border focus:outline-none motion-reduce:transition-none overflow-hidden"
          lang={language}
        >
          <div className="px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.25rem)] overflow-y-auto overflow-x-hidden">
            {Body}
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label={t("shopDialogClose")}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-7 w-7" aria-hidden="true" />
            </button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-xl lg:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-xl ring-1 ring-border/50 p-5 sm:p-6 lg:p-8 motion-reduce:animate-none"
        lang={language}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {Body}
        </div>
        <DialogClose asChild>
          <button
            type="button"
            aria-label={t("shopDialogClose")}
            className="absolute top-3 right-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-7 w-7" aria-hidden="true" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
