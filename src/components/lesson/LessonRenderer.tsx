import { useState } from "react";
import { Check, X, Power, Shirt, Droplets, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  icon: React.ReactNode;
  title: string;
  image?: string;
}

const actions: ActionItem[] = [
  { icon: <Power className="h-5 w-5" />, title: "Turn the AED on" },
  {
    icon: <Shirt className="h-5 w-5" />,
    title: "Expose the person's chest",
    image: "/assets/expose-dry-chest.svg",
  },
  { icon: <Droplets className="h-5 w-5" />, title: "Dry the chest if it's wet" },
];

const choices = [
  { key: "A", text: "It is a legal requirement before using an AED." },
  { key: "B", text: "It tells bystanders the person has woken up." },
  {
    key: "C",
    text: "Anyone touching the person could be shocked or interfere with the heart-rhythm analysis.",
  },
];
const CORRECT = "C";

export default function LessonRenderer() {
  const [picked, setPicked] = useState<string | null>(null);
  const revealed = picked !== null;

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4">
      <article className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Lesson 4 of 4
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-foreground">
            Using an AED
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Follow these steps to safely deliver a shock with an Automated External Defibrillator.
          </p>
        </header>

        {/* Interactive Action List */}
        <section className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
            Quick action steps
          </h2>
          <ol className="space-y-3">
            {actions.map((a, i) => (
              <li
                key={i}
                className="group flex items-start gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2 text-foreground">
                    <span className="text-primary">{a.icon}</span>
                    <p className="font-medium text-base md:text-lg">{a.title}</p>
                  </div>
                  {a.image && (
                    <div className="overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Warning Container */}
        <aside
          role="note"
          className="relative overflow-hidden rounded-2xl bg-card shadow-sm border border-primary/20"
        >
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
          <div className="flex gap-4 p-5 pl-7">
            <AlertTriangle className="h-6 w-6 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                Look for the pictures
              </p>
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                The AED pads will have clear pictures showing where to stick them.
              </p>
            </div>
          </div>
        </aside>

        {/* Quiz Card */}
        <section className="rounded-2xl border-2 border-primary/20 bg-card p-5 md:p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="h-4 w-4" />
            </div>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-primary">
              Knowledge check
            </p>
          </div>
          <p className="font-display text-base md:text-lg font-semibold text-foreground mb-4">
            Why should you call out "STAND CLEAR" before letting the AED analyse or deliver a shock?
          </p>
          <div className="space-y-2">
            {choices.map((c) => {
              const isCorrect = c.key === CORRECT;
              const isPicked = picked === c.key;
              const showCorrect = revealed && isCorrect;
              const showWrong = revealed && isPicked && !isCorrect;
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={revealed}
                  onClick={() => setPicked(c.key)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 md:p-4 text-left transition-all",
                    !revealed && "hover:border-primary hover:bg-primary/5",
                    showCorrect && "border-safe bg-safe/10",
                    showWrong && "border-primary bg-primary/10",
                    revealed && !isCorrect && !isPicked && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      showCorrect && "border-safe bg-safe text-safe-foreground",
                      showWrong && "border-primary bg-primary text-primary-foreground",
                      !revealed && "border-border text-foreground",
                      revealed && !isCorrect && !isPicked && "border-border text-muted-foreground",
                    )}
                  >
                    {showCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : showWrong ? (
                      <X className="h-4 w-4" />
                    ) : (
                      c.key
                    )}
                  </span>
                  <span className="text-sm md:text-base text-foreground leading-relaxed">
                    {c.text}
                  </span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div
              className={cn(
                "mt-4 rounded-lg p-4 text-sm",
                picked === CORRECT
                  ? "bg-safe/10 text-foreground border border-safe/30"
                  : "bg-primary/10 text-foreground border border-primary/30",
              )}
            >
              {picked === CORRECT ? (
                <p>
                  <span className="font-semibold text-safe">Correct.</span> Touching the person
                  during analysis or a shock can interfere with the rhythm reading and put rescuers
                  at risk.
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-primary">Not quite.</span> The correct answer
                  is <strong>C</strong> — anyone touching the person could be shocked or interfere
                  with the heart-rhythm analysis.
                </p>
              )}
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
