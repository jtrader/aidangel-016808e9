import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-amber-950 text-xs sm:text-sm px-3 py-1.5 flex items-center justify-center gap-2 shadow-sm"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>
        You're offline — showing cached guidance. In an emergency call{" "}
        <a href="tel:000" className="underline font-bold">000</a>.
      </span>
    </div>
  );
}
