import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Globe, HeartHandshake, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountry } from "@/hooks/useCountry";
import { programConfigForKbTopic } from "@/lib/kbCourseMap";
import { fireKbProgramConversion } from "@/lib/rsp/faaAdapter";
import { translateStrings } from "@/lib/uiTranslate";

interface Props {
  kbSlug: string;
  lang: string;
}

export default function KbProgramHandoff({ kbSlug, lang }: Props) {
  const config = programConfigForKbTopic(kbSlug);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { code: countryCode } = useCountry();
  const navigate = useNavigate();

  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [labels, setLabels] = useState({
    eyebrow: "Build deeper capability",
    heading: "This topic is included in a full program",
    body: "Level up with a short program tailored for this setting — includes practical skills, scenarios and a certificate.",
    cta: "View program",
    enrolled: "You're enrolled",
    enrolledSub: "Continue your program to complete assessments and get certified.",
  });

  useEffect(() => {
    if (language === "en") return;
    let cancelled = false;
    translateStrings(language, [
      "Build deeper capability",
      "This topic is included in a full program",
      "Level up with a short program tailored for this setting — includes practical skills, scenarios and a certificate.",
      "View program",
      "You're enrolled",
      "Continue your program to complete assessments and get certified.",
    ]).then((s) => {
      if (!cancelled) setLabels({
        eyebrow: s[0], heading: s[1], body: s[2], cta: s[3], enrolled: s[4], enrolledSub: s[5]
      });
    });
    return () => { cancelled = true; };
  }, [language]);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: program } = await supabase.from("programs").select("id,title,slug").eq("slug", config.programSlug).eq("is_published", true).maybeSingle();
      if (!program) {
        setLoading(false);
        return;
      }
      setProgramTitle(program.title);

      if (user) {
        const { data: enrol } = await supabase.from("program_enrollments").select("id").eq("user_id", user.id).eq("program_id", program.id).limit(1).maybeSingle();
        setEnrolled(!!enrol);
      }
      setLoading(false);
    })();
  }, [config, user]);

  if (!config || loading || !programTitle) return null;

  const handleClick = async () => {
    void fireKbProgramConversion(kbSlug, config.programSlug, lang, countryCode ?? null);

    const target = `/programs/${config.programSlug}`;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(target)}`);
      return;
    }
    navigate(target);
  };

  if (enrolled) {
    return (
      <aside className="mt-6 rounded-2xl border border-muted/20 bg-muted/5 p-5 flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted/10 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{labels.enrolled}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{labels.enrolledSub}</p>
        </div>
      </aside>
    );
  }

  // Render tone variations
  let icon = <Briefcase className="h-6 w-6" />;
  if (config.tone === "remote") icon = <Globe className="h-6 w-6" />;
  if (config.tone === "aged") icon = <HeartHandshake className="h-6 w-6" />;

  return (
    <aside className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{labels.eyebrow}</p>
          <h3 lang={lang} className="text-lg font-bold text-foreground mt-0.5">{labels.heading}</h3>
          <p lang={lang} className="text-sm text-muted-foreground mt-1 leading-relaxed">{labels.body}</p>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleClick} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors">
              {labels.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-muted-foreground underline">Learn more</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
