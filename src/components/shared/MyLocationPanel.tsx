// Shared MyLocationPanel — portable wrapper around the AidAngel MyLocation panel.
// Documented API:
//   <MyLocationPanel locale?="au" | ... />
// Strict privacy gate: GPS / W3W / address lookups only run after the user
// explicitly taps "Get My Location".
import { useCallback, useState } from "react";
import { AlertTriangle, Check, Copy, HeartPulse, MapPin, RefreshCw, Share2 } from "lucide-react";
import LegacyMyLocation from "@/components/MyLocation";
import AedMiniMap from "@/components/AedMiniMap";
import { toast } from "@/hooks/use-toast";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";

export interface MyLocationPanelProps {
  locale?: string;
  /** When true, hides the panel's own page header and hardcoded "Call 000"
   *  CTA — used when the panel is shown inside CallConfirmDialog. */
  embedded?: boolean;
}

interface Coords { lat: number; lng: number; accuracy: number; }

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

async function fetchW3W(lat: number, lng: number): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/what3words-convert?lat=${lat}&lng=${lng}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error ?? `http_${r.status}`);
  return j.words as string;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reverse-geocode?lat=${lat}&lng=${lng}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!r.ok) throw new Error("Address lookup failed");
  const j = await r.json();
  if (j?.error) throw new Error(j.error);
  if (!j?.display_name) throw new Error("No address found");
  return j.display_name as string;
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast({ title: "Copied", description: label ?? value });
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast({ title: "Copy failed", description: "Long-press to copy manually." });
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
      aria-label={`Copy ${label ?? "value"}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function DialogMyLocationPanel() {
  const { code } = useCountry();
  const countryIso = code.toUpperCase();
  const emergencyNumber = emergencyNumberForCountry(code);
  const telHref = `tel:${emergencyNumber}`;

  const [coords, setCoords] = useState<Coords | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [w3w, setW3w] = useState<LoadState<string>>({ status: "idle" });
  const [address, setAddress] = useState<LoadState<string>>({ status: "idle" });

  const runW3W = useCallback((lat: number, lng: number) => {
    setW3w({ status: "loading" });
    fetchW3W(lat, lng)
      .then((words) => setW3w({ status: "ok", data: words }))
      .catch((e) => setW3w({ status: "error", message: e?.message ?? "Failed" }));
  }, []);

  const runAddress = useCallback((lat: number, lng: number) => {
    setAddress({ status: "loading" });
    reverseGeocode(lat, lng)
      .then((a) => setAddress({ status: "ok", data: a }))
      .catch((e) => setAddress({ status: "error", message: e?.message ?? "Failed" }));
  }, []);

  const getLocation = useCallback(() => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Your browser does not support location sharing.");
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        const nextCoords: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setCoords(nextCoords);
        runW3W(nextCoords.lat, nextCoords.lng);
        runAddress(nextCoords.lat, nextCoords.lng);
      },
      (err) => {
        setBusy(false);
        setGeoError(
          err.code === 1
            ? "Location access is blocked. Allow location permission, then try again."
            : "Could not get your location. Move outdoors or closer to a window, then try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [runW3W, runAddress]);

  const shareLocation = async () => {
    if (!coords) return;
    const w3wWords = w3w.status === "ok" ? w3w.data : null;
    const addr = address.status === "ok" ? address.data : null;
    const lines = [
      "My location:",
      w3wWords ? `what3words: ///${w3wWords}` : null,
      `Coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      addr ? `Address: ${addr}` : null,
      `Accuracy: within ${Math.round(coords.accuracy)}m`,
      w3wWords ? `Map: https://w3w.co/${w3wWords}` : `Map: https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=18`,
    ].filter(Boolean).join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "My location — First Aid Angel", text: lines });
      } else {
        await navigator.clipboard.writeText(lines);
        toast({ title: "Location copied", description: "Paste it into a message to share." });
      }
    } catch {
      // User cancelled sharing.
    }
  };

  return (
    <div className="space-y-4 pb-1">
      <div className="pr-12">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <MapPin className="h-5 w-5 text-primary" aria-hidden /> My Location
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get your exact location to share with <a href={telHref} className="font-semibold text-primary underline-offset-2 hover:underline">{emergencyNumber}</a> emergency services.
        </p>
      </div>

      <button
        type="button"
        onClick={getLocation}
        disabled={busy}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-base font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" aria-hidden />
            Getting your location…
          </>
        ) : (
          <>📍 {coords ? "Update location" : "Get my location"}</>
        )}
      </button>

      {geoError && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{geoError}</span>
        </div>
      )}

      {!coords ? (
        <section className="rounded-2xl border border-border bg-muted p-5 text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AED near me map</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap <strong>Get my location</strong> above to show AEDs near you.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Read these to the <a href={telHref} className="font-semibold text-primary">{emergencyNumber}</a> operator, or tap to copy and share.
          </p>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">what3words address</h3>
              {w3w.status === "ok" && <CopyButton value={`///${w3w.data}`} label="what3words address" />}
            </div>
            {w3w.status === "loading" && <p className="text-sm text-muted-foreground animate-pulse">Getting what3words address…</p>}
            {w3w.status === "error" && <p className="text-sm text-primary">Could not load what3words address. Your coordinates below are still accurate.</p>}
            {w3w.status === "ok" && (
              <>
                <p className="text-2xl font-bold leading-tight">
                  <span className="text-primary">///</span>
                  <span className="text-foreground">{w3w.data}</span>
                </p>
                <a
                  href={`https://w3w.co/${w3w.data}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                >
                  Open on what3words map →
                </a>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GPS coordinates</h3>
              <CopyButton value={`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`} label="Coordinates" />
            </div>
            <dl className="space-y-1 font-mono text-base">
              <div className="flex items-center gap-3">
                <dt className="w-24 text-muted-foreground">Latitude</dt>
                <dd className="font-semibold text-foreground">{coords.lat.toFixed(6)}</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="w-24 text-muted-foreground">Longitude</dt>
                <dd className="font-semibold text-foreground">{coords.lng.toFixed(6)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Accuracy: within ~{Math.round(coords.accuracy)} metres</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nearest address</h3>
              {address.status === "ok" && <CopyButton value={address.data} label="Address" />}
            </div>
            {address.status === "loading" && <p className="text-sm text-muted-foreground animate-pulse">Getting nearest address…</p>}
            {address.status === "error" && <p className="text-sm text-primary">Could not load nearest address. Use your coordinates or what3words address.</p>}
            {address.status === "ok" && (
              <>
                <p className="text-base text-foreground">{address.data}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Address is approximate — coordinates and what3words above are more precise.
                </p>
              </>
            )}
          </section>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={shareLocation}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-card font-semibold hover:bg-accent"
            >
              <Share2 className="h-4 w-4" /> Share my location
            </button>
            <button
              type="button"
              onClick={getLocation}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-card font-semibold hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" /> Update location
            </button>
          </div>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AED near me map
            </h3>
            <div className="space-y-2">
              <AedMiniMap lat={coords.lat} lng={coords.lng} countryCode={countryIso} />
              <a
                href="/aed-finder"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <HeartPulse className="h-4 w-4 text-destructive" />
                Open full AED map →
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function MyLocationPanel({ embedded = false }: MyLocationPanelProps = {}) {
  if (embedded) return <DialogMyLocationPanel />;
  return <LegacyMyLocation />;
}

export default MyLocationPanel;
