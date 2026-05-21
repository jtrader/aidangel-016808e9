// Build JSON-LD HowTo / FAQPage schemas from a KB topic markdown body.
// Steps come from numbered lists ("1. …") inside H2 sections.
// FAQs come from H2 headings phrased as questions (end with "?").

export type HowToStep = { name: string; text: string };
export type FaqItem = { question: string; answer: string };

function stripInlineMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](href) -> text
    .replace(/\*\*([^*]+)\*\*/g, "$1")        // **bold** -> bold
    .replace(/\*([^*]+)\*/g, "$1")            // *em* -> em
    .replace(/`([^`]+)`/g, "$1")              // `code` -> code
    .replace(/\s+/g, " ")
    .trim();
}

type Section = { heading: string; lines: string[] };

function splitSections(body: string): Section[] {
  const lines = body.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) {
      if (current) sections.push(current);
      current = { heading: stripInlineMd(h[1]), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** Pull all numbered list items as HowTo steps. Section heading is used as step name prefix. */
export function extractHowToSteps(body: string): HowToStep[] {
  const out: HowToStep[] = [];
  for (const sec of splitSections(body)) {
    let stepIdx = 0;
    for (const line of sec.lines) {
      const m = /^\s*\d+\.\s+(.+)$/.exec(line);
      if (!m) continue;
      stepIdx += 1;
      const text = stripInlineMd(m[1]);
      // Use section heading + first ~6 words as step name for readability.
      const short = text.split(" ").slice(0, 8).join(" ");
      const name = sec.heading ? `${sec.heading} — step ${stepIdx}` : short;
      out.push({ name, text });
    }
  }
  return out;
}

/** Treat any H2 ending with "?" as a FAQ; answer = following paragraph text. */
export function extractFaqs(body: string): FaqItem[] {
  const out: FaqItem[] = [];
  for (const sec of splitSections(body)) {
    if (!/\?\s*$/.test(sec.heading)) continue;
    const paragraphs: string[] = [];
    let buf: string[] = [];
    for (const line of sec.lines) {
      if (line.trim() === "") {
        if (buf.length) { paragraphs.push(buf.join(" ")); buf = []; }
      } else {
        buf.push(line.trim());
      }
    }
    if (buf.length) paragraphs.push(buf.join(" "));
    const answer = stripInlineMd(paragraphs.join(" ")).slice(0, 800);
    if (answer) out.push({ question: sec.heading, answer });
  }
  return out;
}

export function buildHowToJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  body: string;
  inLanguage: string;
}): Record<string, unknown> | null {
  const steps = extractHowToSteps(opts.body);
  if (steps.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    totalTime: "PT5M",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${opts.url}#step-${i + 1}`,
    })),
  };
}

export function buildFaqJsonLd(opts: {
  body: string;
  inLanguage: string;
}): Record<string, unknown> | null {
  const faqs = extractFaqs(opts.body);
  if (faqs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: opts.inLanguage,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
