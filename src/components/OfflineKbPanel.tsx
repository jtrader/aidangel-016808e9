import { Link } from "react-router-dom";
import { BookOpen, AlertTriangle } from "lucide-react";
import { OFFLINE_KB_SLUGS } from "@/hooks/useOfflineMode";
import { getTopic } from "@/lib/kb";
import { localizedPath } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

const URGENT = new Set(["cpr", "choking", "anaphylaxis", "bleeding", "heart-attack", "stroke", "snake-bite"]);

const OfflineKbPanel = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center space-y-1">
        <p className="text-sm font-bold text-destructive">AI chat is unavailable offline</p>
        <p className="text-xs text-muted-foreground">Use the saved guides below for first-aid steps.</p>
      </div>

      <section>
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive mb-2">
          <AlertTriangle className="h-3.5 w-3.5" /> Life-threatening
        </h3>
        <ul className="grid grid-cols-2 gap-2">
          {OFFLINE_KB_SLUGS.filter((s) => URGENT.has(s)).map((slug) => {
            const topic = getTopic(slug, language) ?? getTopic(slug, "en");
            return (
              <li key={slug}>
                <Link
                  to={localizedPath(language, `/kb/${slug}`)}
                  className="flex items-start gap-2 rounded-xl border-2 border-destructive/25 bg-destructive/5 p-2.5 hover:border-destructive transition-all"
                >
                  <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5 text-destructive" />
                  <span className="text-sm font-semibold text-foreground leading-tight">{topic?.title ?? slug}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <BookOpen className="h-3.5 w-3.5" /> Other guides
        </h3>
        <ul className="grid grid-cols-2 gap-2">
          {OFFLINE_KB_SLUGS.filter((s) => !URGENT.has(s)).map((slug) => {
            const topic = getTopic(slug, language) ?? getTopic(slug, "en");
            return (
              <li key={slug}>
                <Link
                  to={localizedPath(language, `/kb/${slug}`)}
                  className="flex items-start gap-2 rounded-xl border border-border bg-card p-2.5 hover:border-primary transition-all"
                >
                  <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-sm font-semibold text-foreground leading-tight">{topic?.title ?? slug}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default OfflineKbPanel;
