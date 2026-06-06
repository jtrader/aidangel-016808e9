// First Aid Angel course catalogue shown in the Learn dialogue carousel.
// Sourced from https://firstaidangel.org/programs

export interface Course {
  slug: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  topics: string;
  duration: string;
  credential: string;
  href: string;
  featured?: boolean;
  cta: string;
}

const BASE =
  "https://luocpjawdzwreskitrqj.supabase.co/storage/v1/object/public/lesson-sources/programs";

export const COURSES: Course[] = [
  {
    slug: "emergency-response-essentials",
    title: "Emergency Response Essentials",
    tag: "Featured · Core Course",
    description:
      "The complete 12-topic Australian first aid program covering every core emergency response skill.",
    image: `${BASE}/emergency-response-cover.jpg`,
    topics: "12 topics",
    duration: "60–90 min",
    credential: "Certificate",
    href: "https://firstaidangel.org/programs/emergency-response-essentials",
    featured: true,
    cta: "Start the Core Course",
  },
  {
    slug: "parents-childcare-essentials",
    title: "Parents & Childcare Essentials",
    tag: "Parents & Childcare",
    description:
      "Paediatric-focused first aid for parents, grandparents, nannies and childcare workers.",
    image: `${BASE}/parents-childcare-cover.jpg`,
    topics: "12 topics",
    duration: "240 min",
    credential: "Final exam",
    href: "https://firstaidangel.org/programs/parents-childcare-essentials",
    cta: "View program",
  },
  {
    slug: "workplace-trades-essentials",
    title: "Workplace & Trades Essentials",
    tag: "Workplace & Trades",
    description:
      "Workplace-ready first aid for builders, tradies, factories and offices.",
    image: `${BASE}/workplace-trades-cover.jpg`,
    topics: "12 topics",
    duration: "240 min",
    credential: "Final exam",
    href: "https://firstaidangel.org/programs/workplace-trades-essentials",
    cta: "View program",
  },
  {
    slug: "outdoor-remote-essentials",
    title: "Outdoor & Remote Essentials",
    tag: "Outdoor & Remote",
    description:
      "Bush, beach, hike and remote-area first aid for the moments help is hours away.",
    image: `${BASE}/outdoor-remote-cover.jpg`,
    topics: "12 topics",
    duration: "240 min",
    credential: "Final exam",
    href: "https://firstaidangel.org/programs/outdoor-remote-essentials",
    cta: "View program",
  },
  {
    slug: "aged-care-essentials",
    title: "Aged Care & Carers Essentials",
    tag: "Aged Care & Carers",
    description:
      "First aid for the emergencies most common in older adults.",
    image: `${BASE}/aged-care-cover.jpg`,
    topics: "12 topics",
    duration: "240 min",
    credential: "Final exam",
    href: "https://firstaidangel.org/programs/aged-care-essentials",
    cta: "View program",
  },
];
