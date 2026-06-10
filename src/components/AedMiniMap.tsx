import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { loadMapboxToken, mapboxgl } from "@/lib/mapboxLoader";
import {
  type Aed,
  fetchCountryAeds,
  filterByBounds,
  bboxAround,
  distanceKm,
  accessLabel,
} from "@/lib/openAedMap";

interface Props {
  lat: number;
  lng: number;
  /** ISO-2 country code, e.g. "AU" */
  countryCode?: string;
}

export function AedMiniMap({ lat, lng, countryCode = "AU" }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const [loading, setLoading] = useState(true);
  const [aedCount, setAedCount] = useState(0);
  const [closestDist, setClosestDist] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function showMarkers(aeds: Aed[], map: mapboxgl.Map) {
      const popup = popupRef.current!;

      // Find closest first so we can highlight it
      let closestAed: Aed | null = null;
      let closestD = Infinity;
      for (const aed of aeds) {
        const d = distanceKm(lat, lng, aed.lat, aed.lng);
        if (d < closestD) { closestD = d; closestAed = aed; }
      }

      aeds.forEach((aed) => {
        if (markersRef.current.has(aed.id)) return;
        const dist = distanceKm(lat, lng, aed.lat, aed.lng);
        const meta = accessLabel(aed.access);
        const isClosest = closestAed?.id === aed.id;
        const size = isClosest ? 24 : 16;
        const border = isClosest ? "3px" : "2px";
        const el = document.createElement("div");
        el.style.cssText = `width:${size}px;height:${size}px;border-radius:9999px;background:${meta.color};border:${border} solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;z-index:${isClosest ? 10 : 1}`;
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([aed.lng, aed.lat])
          .addTo(map);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const fromEnc = `${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
          const directions = `https://www.openstreetmap.org/directions?from=${fromEnc}&to=${aed.lat.toFixed(6)}%2C${aed.lng.toFixed(6)}`;
          const distLabel = dist < 1
            ? `~${Math.round(dist * 1000)}m away`
            : `~${dist.toFixed(1)}km away`;
          const html = `
            <div style="font-family:system-ui,sans-serif;max-width:220px;padding:2px">
              <div style="font-weight:600;font-size:14px;margin-bottom:3px">${aed.name || "Defibrillator (AED)"}</div>
              <div style="font-size:12px;color:${meta.color};font-weight:600;margin-bottom:5px">${meta.label}</div>
              <div style="font-size:12px;color:#374151;margin-bottom:4px">${distLabel}</div>
              ${aed.location ? `<div style="font-size:12px;color:#374151;margin-bottom:2px">📍 ${aed.location}</div>` : ""}
              ${aed.opening_hours ? `<div style="font-size:12px;color:#6b7280;margin-bottom:2px">🕐 ${aed.opening_hours}</div>` : ""}
              ${aed.indoor === "yes" ? `<div style="font-size:12px;color:#6b7280;margin-bottom:2px">Indoor</div>` : ""}
              ${aed.phone ? `<div style="font-size:12px;margin-bottom:2px"><a href="tel:${aed.phone}" style="color:#dc2626">📞 ${aed.phone}</a></div>` : ""}
              <a href="${directions}" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;background:#dc2626;color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none">Get directions</a>
              <div style="margin-top:5px;font-size:10px;color:#9ca3af">Source: OpenAEDMap / OpenStreetMap</div>
            </div>`;
          popup.setLngLat([aed.lng, aed.lat]).setHTML(html).addTo(map);
        });
        markersRef.current.set(aed.id, marker);
      });

      setAedCount(aeds.length);
      if (closestAed) setClosestDist(Math.round(closestD * 1000));
    }

    async function init() {
      try {
        await loadMapboxToken();
        if (cancelled || !mapEl.current) return;

        const map = new mapboxgl.Map({
          container: mapEl.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [lng, lat],
          zoom: 15,
        });
        mapRef.current = map;
        popupRef.current = new mapboxgl.Popup({ offset: 16, closeButton: true });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        // User location dot
        const userEl = document.createElement("div");
        userEl.style.cssText =
          "width:14px;height:14px;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.25);z-index:20";
        new mapboxgl.Marker({ element: userEl, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);

        map.on("load", async () => {
          if (cancelled) return;
          setLoading(false);
          try {
            const allAeds = await fetchCountryAeds(countryCode);
            if (cancelled) return;
            // Try 1 km first, fall back to 3 km if sparse
            let nearby = filterByBounds(allAeds, bboxAround(lat, lng, 1), 300);
            if (nearby.length < 3) {
              nearby = filterByBounds(allAeds, bboxAround(lat, lng, 3), 300);
            }
            if (!cancelled) showMarkers(nearby, map);
          } catch {
            if (!cancelled) setError("Couldn't load AED data");
          }
        });
      } catch {
        if (!cancelled) {
          setError("Map failed to load");
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, countryCode]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
      <div ref={mapEl} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-sm text-muted-foreground shadow">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
            {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium shadow">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {aedCount > 0 ? (
            <>
              {aedCount} AED{aedCount !== 1 ? "s" : ""} nearby
              {closestDist !== null && (
                <span className="text-muted-foreground">
                  · closest ~{closestDist < 1000 ? `${closestDist}m` : `${(closestDist / 1000).toFixed(1)}km`}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">No AEDs found nearby</span>
          )}
        </div>
      )}
    </div>
  );
}

export default AedMiniMap;
