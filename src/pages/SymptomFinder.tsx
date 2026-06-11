import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Link } from "react-router-dom";
import {
  Search,
  Phone,
  AlertTriangle,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  List,
} from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { useLanguage, type LanguageCode } from "@/contexts/LanguageContext";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";
import { localizedPath, SITE_ORIGIN, HREFLANG } from "@/lib/i18n";
import { getTopic } from "@/lib/kb";
import { SYMPTOM_LANDERS } from "@/data/symptomLanders";
import NetworkFooter from "@/components/NetworkFooter";
import EmergencyCallButton from "@/components/EmergencyCallButton";
import EmergencyNumberLink from "@/components/shared/EmergencyNumberLink";
import { resolveEmergency, resolveCountry } from "@/lib/resolveEmergency";
import {
  getQuestion,
  getResult,
  SEVERITY_CONFIG,
  FLOW_QUESTIONS,
  type FlowResult,
} from "@/data/symptomFlow";

/* ─── Browse-all data ──────────────────────────────────────────── */

type Symptom = {
  label: string;
  slug: string;
  urgent?: boolean;
  keywords: string[];
};

const SYMPTOMS: Symptom[] = [
  { label: "Not breathing / no pulse", slug: "cpr", urgent: true, keywords: ["unresponsive", "collapsed", "no pulse", "cardiac arrest"] },
  { label: "Can't breathe / choking", slug: "choking", urgent: true, keywords: ["choke", "blocked airway", "can't speak"] },
  { label: "Severe allergic reaction", slug: "anaphylaxis", urgent: true, keywords: ["swelling", "epipen", "tongue", "throat"] },
  { label: "Heavy bleeding", slug: "bleeding", urgent: true, keywords: ["wound", "blood", "haemorrhage", "cut"] },
  { label: "Face drooping / slurred speech", slug: "stroke", urgent: true, keywords: ["fast", "weakness", "one side", "facial droop"] },
  { label: "Chest pain or pressure", slug: "heart-attack", urgent: true, keywords: ["heart", "angina", "tight chest", "arm pain"] },
  { label: "Snake bite", slug: "snake-bite", urgent: true, keywords: ["bitten", "snake", "fang"] },
  { label: "Spider bite", slug: "spider-bite", urgent: true, keywords: ["funnel web", "redback", "spider"] },
  { label: "Drowning / pulled from water", slug: "drowning", urgent: true, keywords: ["water", "submerged"] },
  { label: "Electric shock", slug: "electric-shock", urgent: true, keywords: ["electrocuted", "current"] },
  { label: "Seizure / fitting", slug: "seizures", keywords: ["epilepsy", "convulsion", "fit"] },
  { label: "Unconscious but breathing", slug: "recovery-position", keywords: ["passed out", "unresponsive breathing"] },
  { label: "Asthma attack", slug: "asthma", keywords: ["wheezing", "inhaler", "puffer"] },
  { label: "Burn or scald", slug: "burns", keywords: ["fire", "hot", "scald", "scalded"] },
  { label: "Suspected poisoning", slug: "poisoning", keywords: ["swallowed", "overdose", "chemical"] },
  { label: "Fainting / lightheaded", slug: "fainting", keywords: ["dizzy", "blackout"] },
  { label: "Diabetic emergency", slug: "diabetes", keywords: ["hypo", "low sugar", "insulin"] },
  { label: "Jellyfish or marine sting", slug: "jellyfish-stings", keywords: ["bluebottle", "stinger", "box jellyfish"] },
  { label: "Overheating / heat stroke", slug: "heat-illness", keywords: ["hot", "heat exhaustion", "dehydrated"] },
  { label: "Too cold / hypothermia", slug: "hypothermia", keywords: ["freezing", "cold"] },
  { label: "Suspected broken bone", slug: "fractures", keywords: ["fracture", "broken", "snap"] },
  { label: "Sprain or strain", slug: "sprains-strains", keywords: ["twisted", "ankle", "rolled"] },
  { label: "Head knock / concussion", slug: "head-injury", keywords: ["concussion", "hit head"] },
  { label: "Possible spinal injury", slug: "spinal-injury", keywords: ["neck", "back injury"] },
  { label: "Eye injury or chemical splash", slug: "eye-injuries", keywords: ["eye", "vision", "splash"] },
  { label: "Knocked-out tooth", slug: "dental-injury", keywords: ["tooth", "dental"] },
  { label: "Nosebleed", slug: "nosebleed", keywords: ["nose bleed", "epistaxis"] },
  { label: "Mild allergic reaction", slug: "allergic-reactions", keywords: ["hives", "rash", "itchy"] },
  { label: "Shock (pale, clammy, weak pulse)", slug: "shock", keywords: ["pale", "clammy"] },
  { label: "Sunburn", slug: "sunburn", keywords: ["sun"] },
  { label: "Dehydrated", slug: "dehydration", keywords: ["thirsty", "dry mouth"] },
];

/* ─── Flow state ───────────────────────────────────────────────── */

type FlowStep =
  | { type: "question"; id: string }
  | { type: "result"; id: string };

/* ─── Result panel ─────────────────────────────────────────────── */

function ResultPanel({
  result,
  emergencyNumber,
  countryName,
  language,
  onReset,
}: {
  result: FlowResult;
  emergencyNumber: string;
  countryName: string;
  language: LanguageCode;
  onReset: () => void;
}) {
  const cfg = SEVERITY_CONFIG[result.severity];
  const kbHref = result.kbSlug ? localizedPath(language, `/kb/${result.kbSlug}`) : null;
  const re = (t: string) => resolveCountry(resolveEmergency(t, emergencyNumber), countryName);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Severity badge + title */}
      <div className="flex flex-wrap items-start gap-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${cfg.className}`}>
          {cfg.label}
        </span>
        <h2 className="text-xl font-bold text-foreground leading-snug">{result.title}</h2>
      </div>

      {result.lead && (
        <p className="text-sm text-muted-foreground leading-relaxed">{re(result.lead)}</p>
      )}

      {/* Emergency call CTA */}
      {result.callEmergency && (
        <EmergencyNumberLink
          number={emergencyNumber}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-3.5 text-destructive-foreground font-bold text-base shadow-md hover:opacity-95 transition"
        >
          <Phone className="h-5 w-5 flex-shrink-0" />
          <span>{result.callReason?.replace(/000/g, emergencyNumber) ?? `Call ${emergencyNumber} now`}</span>
        </EmergencyNumberLink>
      )}

      {/* Steps */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
          <List className="h-4 w-4 text-primary" /> Steps
        </h3>
        <ol className="space-y-2.5">
          {result.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-foreground leading-relaxed">{re(step)}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Do not */}
      {result.doNot && result.doNot.length > 0 && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-destructive uppercase tracking-wider">
            <XCircle className="h-4 w-4" /> Do NOT
          </h3>
          <ul className="space-y-1.5">
            {result.doNot.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-destructive" />
                <p className="text-sm text-foreground">{re(item)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch for */}
      {result.watchFor && result.watchFor.length > 0 && (
        <div className="rounded-2xl border border-orange-300/40 bg-orange-50 dark:bg-orange-950/20 p-4 space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider">
            <Eye className="h-4 w-4" /> Watch for — escalate if you see these
          </h3>
          <ul className="space-y-1.5">
            {result.watchFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-orange-500" />
                <p className="text-sm text-foreground">{re(item)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full guide link */}
      {kbHref && (
        <Link
          to={kbHref}
          className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 hover:border-primary hover:shadow-sm transition-all"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Open full guide</p>
            <p className="text-sm font-semibold text-foreground truncate mt-0.5">
              {(getTopic(result.kbSlug!, language) ?? getTopic(result.kbSlug!, "en"))?.title ?? result.title}
            </p>
          </div>
        </Link>
      )}

      {/* Restart */}
      <button
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <RotateCcw className="h-4 w-4" /> Start again
      </button>
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */

const SymptomFinder = () => {
  const { language } = useLanguage();
  const { code: countryCode, country } = useCountry();
  const emergencyNumber = emergencyNumberForCountry(countryCode);
  const countryName = (() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode.toUpperCase()) || country.name;
    } catch { return country.name; }
  })();

  /* Flow state */
  const [history, setHistory] = useState<FlowStep[]>([{ type: "question", id: "root" }]);
  const current = history[history.length - 1];

  /* Browse-all state */
  const [showBrowse, setShowBrowse] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SYMPTOMS;
    return SYMPTOMS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q) || q.includes(k)) ||
        s.slug.includes(q),
    );
  }, [query]);

  const urgentList = filtered.filter((s) => s.urgent);
  const otherList = filtered.filter((s) => !s.urgent);

  const landerByKb = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of SYMPTOM_LANDERS) {
      if (!m.has(l.kbSlug)) m.set(l.kbSlug, l.slug);
    }
    return m;
  }, []);
  const linkFor = (kbSlug: string) => {
    const lander = landerByKb.get(kbSlug);
    return lander ? `/symptoms/${lander}` : localizedPath(language, `/kb/${kbSlug}`);
  };

  /* Navigation helpers */
  const goBack = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const reset = () => setHistory([{ type: "question", id: "root" }]);

  const choose = (next: string | null, resultId?: string) => {
    if (next) {
      setHistory((h) => [...h, { type: "question", id: next }]);
    } else if (resultId) {
      setHistory((h) => [...h, { type: "result", id: resultId }]);
    }
  };

  const homePath = localizedPath(language, "/");
  const pageUrl = `${SITE_ORIGIN}/symptoms`;
  const isRoot = history.length === 1 && current.type === "question" && current.id === "root";

  /* Breadcrumb labels */
  const breadcrumbs = history.slice(0, -1).map((step) => {
    if (step.type === "question") {
      return getQuestion(step.id)?.question ?? step.id;
    }
    return getResult(step.id)?.title ?? step.id;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        lang={language}
        basePath="/symptoms"
        title="First aid by symptom — what to do right now · First Aid Angel"
        description="Find first aid steps fast by symptom: chest pain, severe bleeding, choking, stroke signs, allergic reaction, snake bite, burns and more. St John Australian First Aid 5th Edition."
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "First aid by symptom",
            url: pageUrl,
            inLanguage: HREFLANG[language],
            description: "Symptom-first directory routing to step-by-step Australian first aid guides.",
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: SYMPTOMS.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.label,
              url: `${SITE_ORIGIN}/kb/${s.slug}`,
            })),
          },
        ]}
      />
      <SiteHeader backTo={homePath} backLabel="Home" />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
            What's happening right now?
          </h1>
          <p className="text-muted-foreground mb-5 text-sm">
            Answer a few quick questions for tailored first-aid steps. For any life-threatening emergency,{" "}
            <EmergencyNumberLink number={emergencyNumber} className="text-primary font-semibold underline">
              Call {emergencyNumber}
            </EmergencyNumberLink>{" "}
            first.
          </p>

          {/* Persistent emergency call button */}
          <EmergencyNumberLink
            number={emergencyNumber}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-destructive-foreground font-bold text-base shadow-md hover:opacity-95 transition"
          >
            <Phone className="h-5 w-5" />
            Emergency — Call {emergencyNumber}
          </EmergencyNumberLink>

          {/* ── Guided flow ──────────────────────────────────────────── */}
          {!showBrowse && (
            <div className="space-y-4">
              {/* Back + breadcrumb */}
              {!isRoot && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  {breadcrumbs.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {breadcrumbs[breadcrumbs.length - 1]}
                    </p>
                  )}
                </div>
              )}

              {/* Question card */}
              {current.type === "question" && (() => {
                const q = getQuestion(current.id);
                if (!q) return null;
                return (
                  <div className="animate-fade-in">
                    <div className="mb-4">
                      <p className="text-lg font-bold text-foreground leading-snug">{q.question}</p>
                      {q.subtext && (
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{q.subtext}</p>
                      )}
                    </div>
                    <ul className={q.id === "root" ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          <button
                            onClick={() => choose(opt.next, opt.resultId)}
                            className="w-full text-left rounded-2xl border-2 border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-all"
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Result */}
              {current.type === "result" && (() => {
                const r = getResult(current.id);
                if (!r) return null;
                return (
                  <ResultPanel
                    result={r}
                    emergencyNumber={emergencyNumber}
                    countryName={countryName}
                    language={language}
                    onReset={reset}
                  />
                );
              })()}

              {/* Browse-all toggle */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => setShowBrowse(true)}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  Browse all symptoms instead →
                </button>
              </div>
            </div>
          )}

          {/* ── Browse all ───────────────────────────────────────────── */}
          {showBrowse && (
            <div className="animate-fade-in space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBrowse(false)}
                  className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Guided finder
                </button>
                <span className="text-sm text-muted-foreground">Browse all symptoms</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  aria-label="Search symptoms"
                  placeholder="Type a symptom (e.g. bleeding, choking, chest pain)…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>

              {urgentList.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-destructive mb-3 inline-flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Life-threatening — act fast
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {urgentList.map((s) => {
                      const t = getTopic(s.slug, language) ?? getTopic(s.slug, "en");
                      return (
                        <li key={s.slug}>
                          <Link
                            to={linkFor(s.slug)}
                            className="block p-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 hover:border-destructive transition-all"
                          >
                            <p className="font-semibold text-foreground text-sm">{s.label}</p>
                            {t && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.title}</p>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {otherList.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                    Other symptoms
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {otherList.map((s) => {
                      const t = getTopic(s.slug, language) ?? getTopic(s.slug, "en");
                      return (
                        <li key={s.slug}>
                          <Link
                            to={linkFor(s.slug)}
                            className="block p-3 rounded-xl border border-border bg-card hover:border-primary transition-all"
                          >
                            <p className="font-semibold text-foreground text-sm">{s.label}</p>
                            {t && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.title}</p>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No symptoms matched. Try the{" "}
                  <Link to={localizedPath(language, "/kb")} className="text-primary underline font-semibold">
                    full knowledge base
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <EmergencyCallButton />
      <NetworkFooter />
    </div>
  );
};

export default SymptomFinder;
