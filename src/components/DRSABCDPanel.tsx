import { useState } from "react";
import {
  ShieldAlert,
  MessageCircle,
  Phone,
  Wind,
  Activity,
  HeartPulse,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const steps = [
  {
    letter: "D",
    label: "Danger",
    blurb: "Check the scene is safe",
    icon: ShieldAlert,
    prompt: "Explain the Danger step in DRSABCD",
  },
  {
    letter: "R",
    label: "Response",
    blurb: "Talk & touch — any reply?",
    icon: MessageCircle,
    prompt: "Explain the Response step in DRSABCD",
  },
  {
    letter: "S",
    label: "Send for help",
    blurb: "Call 000 right away",
    icon: Phone,
    prompt: "Explain the Send for help step in DRSABCD",
  },
  {
    letter: "A",
    label: "Airway",
    blurb: "Open & clear the airway",
    icon: Wind,
    prompt: "Explain the Airway step in DRSABCD",
  },
  {
    letter: "B",
    label: "Breathing",
    blurb: "Look, listen, feel",
    icon: Activity,
    prompt: "Explain the Breathing step in DRSABCD",
  },
  {
    letter: "C",
    label: "CPR",
    blurb: "30 compressions : 2 breaths",
    icon: HeartPulse,
    prompt: "Explain the CPR step in DRSABCD",
  },
  {
    letter: "D",
    label: "Defibrillator",
    blurb: "Attach AED & follow prompts",
    icon: Zap,
    prompt: "Explain the Defibrillator step in DRSABCD",
  },
];

interface DRSABCDPanelProps {
  onSelect: (prompt: string) => void;
}

const DRSABCDPanel = ({ onSelect }: DRSABCDPanelProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-destructive/10 via-primary/5 to-transparent hover:from-destructive/15 transition-colors"
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
              <HeartPulse className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block font-display font-bold text-sm text-foreground leading-tight">
                DRSABCD Action Plan
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Tap any letter for a guided walk-through
              </span>
            </span>
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {expanded && (
          <div className="p-3 sm:p-4 space-y-3">
            {/* Visual letter row */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onSelect(step.prompt)}
                    aria-label={`${step.letter} – ${step.label}`}
                    className="group flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-accent transition-colors"
                  >
                    <span className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground flex items-center justify-center font-display font-bold text-base sm:text-lg shadow-sm group-hover:scale-105 group-active:scale-95 transition-transform">
                      {step.letter}
                      <Icon className="absolute -bottom-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-card text-destructive rounded-full p-0.5 border border-border" />
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-foreground leading-tight text-center">
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detail list */}
            <div className="space-y-1 pt-1 border-t border-border/60">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onSelect(step.prompt)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-display font-bold text-sm">
                      {step.letter}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-foreground leading-tight">
                        {step.label}
                      </span>
                      <span className="block text-xs text-muted-foreground leading-tight">
                        {step.blurb}
                      </span>
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                onSelect(
                  "Start the DRSABCD walk-through now — one step at a time."
                )
              }
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <HeartPulse className="h-4 w-4" />
              Start full walk-through
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DRSABCDPanel;
