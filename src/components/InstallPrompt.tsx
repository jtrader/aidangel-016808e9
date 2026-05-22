import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "faa.install.dismissedAt";
const DISMISS_DAYS = 14;

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const cooledDown = Date.now() - dismissedAt > DISMISS_DAYS * 86400000;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      if (cooledDown) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setEvt(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onInstall = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setVisible(false);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible || !evt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:max-w-sm z-[55] rounded-2xl border border-border bg-card shadow-lg p-4">
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Download className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm">Install First Aid Angel</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            One-tap access, works offline in emergencies.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onInstall}
              className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              Install
            </button>
            <button
              onClick={onDismiss}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
