import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchSuggestions, type Suggestion } from "@/data/firstAidSuggestions";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = searchSuggestions(input, 6);
    setSuggestions(next);
    setHighlight(0);
    setOpen(next.length > 0);
  }, [input]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setInput("");
    setOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput(suggestions[highlight].text);
    } else if (e.key === "Enter") {
      // If user is navigating with arrows (moved past first), pick highlight; otherwise send raw input.
      if (highlight > 0) {
        e.preventDefault();
        submit(suggestions[highlight].text);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="First aid suggestions"
          className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-40 animate-fade-in"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.text}
              role="option"
              aria-selected={i === highlight}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                submit(s.text);
              }}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm border-b border-border/50 last:border-0 ${
                i === highlight ? "bg-muted" : "hover:bg-muted/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-foreground leading-snug">{s.text}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                  {s.category}
                </div>
              </div>
            </li>
          ))}
          <li className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/40">
            ↑↓ navigate · Tab complete · Enter send · Esc close
          </li>
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(suggestions.length > 0)}
          placeholder={t("inputPlaceholder")}
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="first-aid-suggestions"
          className="flex-1 min-h-11 px-4 py-3 rounded-xl border border-input bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="inline-flex items-center justify-center gap-1.5 min-h-11 min-w-11 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
