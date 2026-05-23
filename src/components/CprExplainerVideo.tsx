import { useState } from "react";
import { ChevronDown, PlayCircle } from "lucide-react";
import type { CountryCode } from "@/lib/donations";

// Country → localized DRSABCD explainer video slug (matches files in the
// public `explainer-videos` storage bucket).
const VIDEO_SLUGS: Partial<Record<CountryCode, string>> = {
  au: "au-en-drsabcd",
  us: "us-en-drsabcd",
  gb: "gb-en-drsabcd",
  ca: "ca-en-drsabcd",
  nz: "nz-en-drsabcd",
  ie: "ie-en-drsabcd",
  sg: "sg-en-drsabcd",
  za: "za-en-drsabcd",
  in: "in-hi-drsabcd",
  de: "de-de-drsabcd",
  fr: "fr-fr-drsabcd",
  es: "es-es-drsabcd",
};

const FALLBACK_SLUG = "au-en-drsabcd";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function videoUrlForCountry(code: CountryCode): string {
  const slug = VIDEO_SLUGS[code] ?? FALLBACK_SLUG;
  return `${SUPABASE_URL}/storage/v1/object/public/explainer-videos/${slug}.mp4`;
}

export function CprExplainerVideo({ countryCode }: { countryCode: CountryCode }) {
  const [open, setOpen] = useState(false);
  const src = videoUrlForCountry(countryCode);
  const localized = countryCode in VIDEO_SLUGS;

  return (
    <section className="mb-4 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/40"
      >
        <span className="flex items-center gap-2 text-left">
          <PlayCircle className="h-5 w-5 text-primary shrink-0" />
          <span>
            <span className="block text-sm font-semibold leading-tight">
              Watch the 60-second DRSABCD explainer
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {localized ? "Localized for your region" : "Default version (your region coming soon)"}
            </span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="bg-black">
          <video
            key={src}
            src={src}
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto block max-h-[60vh] mx-auto"
          />
        </div>
      )}
    </section>
  );
}
