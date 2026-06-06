// Static map of KB topic slug → course slug.
// Only topics with a matching course are included.
// Authoritative map derived from src/components/TopicCover.tsx KB_TO_COURSE
export const KB_COURSE_MAP: Record<string, string> = {
  aed: "aed-use",
  "allergic-reactions": "anaphylaxis-allergies",
  anaphylaxis: "anaphylaxis-allergies",
  asthma: "asthma",
  bleeding: "severe-bleeding",
  burns: "burns-scalds",
  choking: "choking",
  cpr: "cpr-essentials",
  dehydration: "dehydration",
  "dental-injury": "dental-injury",
  diabetes: "diabetes",
  drowning: "drowning",
  drsabcd: "recovery-drsabcd",
  "electric-shock": "electric-shock",
  "eye-injuries": "eye-injuries",
  fainting: "fainting",
  fractures: "fractures",
  "head-injury": "head-injuries-seizures",
  "heart-attack": "stroke-heart-attack",
  "heat-illness": "heat-emergencies",
  hypothermia: "cold-emergencies",
  "jellyfish-stings": "bites-and-stings",
  "mental-health-first-aid": "mental-health-first-aid",
  nosebleed: "nosebleed",
  poisoning: "poisoning",
  "recovery-position": "recovery-drsabcd",
  seizures: "head-injuries-seizures",
  shock: "shock",
  "snake-bite": "bites-and-stings",
  "spider-bite": "bites-and-stings",
  "spinal-injury": "spinal-injury",
  "sprains-strains": "sprains-strains",
  stroke: "stroke-heart-attack",
  sunburn: "sunburn",
};

// Sensitive KB slugs set
export const SENSITIVE_KB_SLUGS = new Set<string>(["mental-health-first-aid"]);

// KB topic → program mapping (only three topics map to programs)
export const KB_PROGRAM_MAP: Record<string, { programSlug: string; tone: "workplace" | "remote" | "aged" }> = {
  "workplace-first-aid": { programSlug: "workplace-trades-essentials", tone: "workplace" },
  "remote-first-aid": { programSlug: "outdoor-remote-essentials", tone: "remote" },
  "elderly-care": { programSlug: "aged-care-essentials", tone: "aged" },
};

/**
 * Returns the course slug for a given KB topic slug, or null if no
 * matching course exists for this topic.
 */
export function courseSlugForKbTopic(kbSlug: string): string | null {
  return KB_COURSE_MAP[kbSlug] ?? null;
}

/**
 * Returns program config for a KB topic if it maps to a program
 */
export function programConfigForKbTopic(kbSlug: string): { programSlug: string; tone: "workplace" | "remote" | "aged" } | null {
  return KB_PROGRAM_MAP[kbSlug] ?? null;
}

export function hasHandoff(kbSlug: string): boolean {
  return !!KB_COURSE_MAP[kbSlug] || !!KB_PROGRAM_MAP[kbSlug];
}
