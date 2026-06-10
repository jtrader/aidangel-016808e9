import { WifiOff, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { CacheStatus } from "@/hooks/useOfflineMode";

interface Props {
  enabled: boolean;
  cacheStatus: CacheStatus;
  isOnline: boolean;
  onToggle: () => void;
}

const statusContent: Record<CacheStatus, { icon: React.ReactNode; text: string } | null> = {
  idle: null,
  caching: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />,
    text: "Saving guides…",
  },
  ready: {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
    text: "Guides saved for offline use",
  },
  error: {
    icon: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
    text: "Couldn't save — try again",
  },
};

const OfflineToggle = ({ enabled, cacheStatus, isOnline, onToggle }: Props) => {
  const status = statusContent[cacheStatus];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <WifiOff className={`h-4 w-4 flex-shrink-0 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-sm font-medium text-foreground">Available offline</span>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label="Enable offline mode"
          disabled={cacheStatus === "caching"}
        />
      </label>

      {/* Status row */}
      {status && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in">
          {status.icon}
          {status.text}
        </span>
      )}

      {/* Offline indicator (always shown when no connection) */}
      {!isOnline && (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive animate-fade-in">
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — guides below are available
        </span>
      )}
    </div>
  );
};

export default OfflineToggle;
