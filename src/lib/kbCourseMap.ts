// Static map of KB topic slug → course slug.
// Only topics with a matching course are included.
// Derived from the course_slug fields in kb/_meta.json.
export const KB_COURSE_MAP: Record<string, string> = {
  drsabcd: "drsabcd",
  cpr: "cpr",
  aed: "aed-use",
  "recovery-position": "recovery-position",
  choking: "choking",
  bleeding: "bleeding",
  burns: "burns",
  shock: "shock",
  asthma: "asthma",
  anaphylaxis: "anaphylaxis",
  "allergic-reactions": "allergic-reactions",
  "heart-attack": "heart-attack",
  stroke: "stroke",
  seizures: "seizures",
  diabetes: "diabetes",
  "head-injury": "head-injury",
  "spinal-injury": "spinal-injury",
  fractures: "fractures",
  "sprains-strains": "sprains-strains",
  "snake-bite": "snake-bite",
  "spider-bite": "spider-bite",
  "jellyfish-stings": "jellyfish-stings",
  "heat-illness": "heat-illness",
  hypothermia: "hypothermia",
  poisoning: "poisoning",
  drowning: "drowning",
  nosebleed: "nosebleed",
  fainting: "fainting",
  dehydration: "dehydration",
  sunburn: "sunburn",
  "dental-injury": "dental-injury",
  "eye-injuries": "eye-injuries",
  "electric-shock": "electric-shock",
};

/**
 * Returns the course slug for a given KB topic slug, or null if no
 * matching course exists for this topic.
 */
export function courseSlugForKbTopic(kbSlug: string): string | null {
  return KB_COURSE_MAP[kbSlug] ?? null;
}
