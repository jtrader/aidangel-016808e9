// Centralized location service.
// Rule 4: reverse geocoding is server-side only — proxied via the Supabase
// edge function `reverse-geocode`. We never call Nominatim directly from the
// browser, never log coordinates, and only run after explicit user opt-in.

export interface Coords {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface GeoError {
  code: number;
  message: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${SUPABASE_KEY}`,
    apikey: SUPABASE_KEY,
  };
}

/**
 * Request GPS coordinates from the browser. The caller MUST have obtained
 * explicit user opt-in (e.g. a button press) before calling this.
 */
export function getCurrentCoords(
  opts: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({ code: -1, message: "Geolocation not supported" } as GeoError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject({ code: err.code, message: err.message } as GeoError),
      opts,
    );
  });
}

/** Convert coordinates to a what3words address via the edge function. */
export async function fetchWhat3Words(lat: number, lng: number): Promise<string> {
  const url = `${SUPABASE_URL}/functions/v1/what3words-convert?lat=${lat}&lng=${lng}`;
  const r = await fetch(url, { headers: authHeaders() });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error ?? `http_${r.status}`);
  return j.words as string;
}

/** Reverse-geocode coordinates to a human-readable address. Server-side only. */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `${SUPABASE_URL}/functions/v1/reverse-geocode?lat=${lat}&lng=${lng}`;
  const r = await fetch(url, { headers: authHeaders() });
  if (!r.ok) throw new Error("Address lookup failed");
  const j = await r.json();
  if (j?.error) throw new Error(j.error);
  if (!j?.display_name) throw new Error("No address found");
  return j.display_name as string;
}

/** Convenience: run all three lookups in parallel. */
export async function getLocationBundle(): Promise<{
  coords: Coords;
  words: string | null;
  address: string | null;
}> {
  const coords = await getCurrentCoords();
  const [words, address] = await Promise.all([
    fetchWhat3Words(coords.lat, coords.lng).catch(() => null),
    reverseGeocode(coords.lat, coords.lng).catch(() => null),
  ]);
  return { coords, words, address };
}
