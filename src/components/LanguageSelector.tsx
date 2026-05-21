import { Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, languages, LanguageCode } from "@/contexts/LanguageContext";
import { stripLangPrefix, localizedPath } from "@/lib/i18n";

const AUTO_VALUE = "__auto__";

const LanguageSelector = () => {
  const { language, isAuto, setLanguage, setAuto } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToLang = (lang: LanguageCode) => {
    const { basePath } = stripLangPrefix(location.pathname);
    const target = localizedPath(lang, basePath);
    if (target !== location.pathname) navigate(target);
  };

  const handleChange = (value: string) => {
    if (value === AUTO_VALUE) {
      const detected = setAuto();
      navigateToLang(detected);
      return;
    }
    const next = value as LanguageCode;
    setLanguage(next);
    navigateToLang(next);
  };


  const selectValue = isAuto ? AUTO_VALUE : language;

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={selectValue}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Select language"
        title="Select language"
        className="appearance-none bg-transparent border border-border rounded-lg px-2 py-1 pr-6 text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value={AUTO_VALUE}>
          🌐 Auto-detect{isAuto ? ` — ${language.toUpperCase()}` : ""}
        </option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} — {lang.region}
          </option>
        ))}
      </select>
      <svg className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5l3 3 3-3" />
      </svg>
    </div>
  );
};

export default LanguageSelector;
