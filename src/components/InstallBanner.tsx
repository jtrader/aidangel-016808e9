import { useEffect, useState } from "react";
import { Download, Smartphone, WifiOff, Zap, X } from "lucide-react";
import aidAngelLogo from "@/assets/aidangel-logo.png";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "faa.install.banner.dismissedAt";
const DISMISS_DAYS = 30;

export default function InstallBanner() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_DAYS * 86400000) {
      setDismissed(true);
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    // Pick up the event captured in main.tsx before React mounted.
    const w = window as typeof window & { __bipEvent?: BIPEvent };
    if (w.__bipEvent) setEvt(w.__bipEvent);

    // Also listen for future fires (e.g. after dismissing and re-opening).
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      w.__bipEvent = e as BIPEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onInstall = async () => {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") setInstalled(true);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  if (dismissed || installed) return null;

  // iOS hint: no beforeinstallprompt, but can still be added via Share sheet
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const canNativeInstall = !!evt;

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 p-4 shadow-sm overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/5 pointer-events-none" />

        <button
          onClick={onDismiss}
          aria-label="Dismiss install prompt"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <img
            src={aidAngelLogo}
            alt="First Aid Angel"
            className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              Install First Aid Angel
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              One tap to life-saving guidance — always ready, even without signal.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { Icon: WifiOff, label: "Works offline" },
                { Icon: Zap, label: "Instant access" },
                { Icon: Smartphone, label: "Home screen" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
                >
                  <Icon className="h-2.5 w-2.5" />
                  {label}
                </span>
              ))}
            </div>

            {canNativeInstall ? (
              <button
                onClick={onInstall}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Add to Home Screen
              </button>
            ) : isIos ? (
              <p className="mt-2.5 text-[11px] text-muted-foreground leading-relaxed">
                Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> in Safari to install.
              </p>
            ) : (
              <p className="mt-2.5 text-[11px] text-muted-foreground leading-relaxed">
                Open in Chrome or Edge and tap <strong>Install app</strong> from the browser menu.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
