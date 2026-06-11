import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "faa-offline-mode";

export type CacheStatus = "idle" | "caching" | "ready" | "error";

/** Key KB slugs pre-cached when offline mode is enabled. */
export const OFFLINE_KB_SLUGS = [
  "cpr",
  "choking",
  "anaphylaxis",
  "bleeding",
  "heart-attack",
  "stroke",
  "burns",
  "snake-bite",
  "seizures",
  "recovery-position",
  "asthma",
  "drsabcd",
  "head-injury",
  "poisoning",
  "diabetes",
];

async function cacheKbGuides(): Promise<void> {
  if (!("caches" in window)) return;
  const urls = ["/", "/cpr", ...OFFLINE_KB_SLUGS.map((s) => `/kb/${s}`)];
  const cache = await caches.open("faa-offline-guides");
  await Promise.all(
    urls.map((url) =>
      fetch(url, { cache: "reload" })
        .then((res) => { if (res.ok) cache.put(url, res); })
        .catch(() => undefined),
    ),
  );
}

export function useOfflineMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>("idle");

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  const enable = useCallback(async () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setEnabled(true);
    setCacheStatus("caching");
    try {
      await cacheKbGuides();
      setCacheStatus("ready");
    } catch {
      setCacheStatus("error");
    }
  }, []);

  const disable = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setEnabled(false);
    setCacheStatus("idle");
  }, []);

  const toggle = useCallback(() => {
    if (enabled) disable(); else void enable();
  }, [enabled, enable, disable]);

  return { enabled, isOnline, cacheStatus, toggle };
}
