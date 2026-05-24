import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  BookOpen,
  ArrowRight,
  HeartPulse,
  Bandage,
  Flame,
  Bug,
  Brain,
  Thermometer,
  Droplets,
  AlertTriangle,
  Baby,
  Pill,
  Activity,
  Stethoscope,
} from "lucide-react";
import { topics, topicsByCategory } from "@/lib/kb";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Map category keywords to icons (creative visual hook)
function categoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("cpr") || c.includes("cardiac") || c.includes("heart"))
    return HeartPulse;
  if (c.includes("bleed") || c.includes("wound")) return Bandage;
  if (c.includes("burn")) return Flame;
  if (c.includes("bite") || c.includes("sting") || c.includes("venom"))
    return Bug;
  if (c.includes("head") || c.includes("brain") || c.includes("seizure"))
    return Brain;
  if (c.includes("heat") || c.includes("cold") || c.includes("temperature"))
    return Thermometer;
  if (c.includes("drown") || c.includes("water")) return Droplets;
  if (c.includes("poison") || c.includes("drug") || c.includes("medication"))
    return Pill;
  if (c.includes("child") || c.includes("infant") || c.includes("baby"))
    return Baby;
  if (c.includes("breath") || c.includes("airway") || c.includes("respir"))
    return Stethoscope;
  if (c.includes("emergency") || c.includes("trauma")) return AlertTriangle;
  if (c.includes("medical") || c.includes("illness")) return Activity;
  return BookOpen;
}

export function TopicExplorerDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const grouped = useMemo(() => topicsByCategory("en"), []);
  const categories = useMemo(
    () => ["All", ...Object.keys(grouped)],
    [grouped],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      activeCategory === "All"
        ? topics
        : topics.filter((t) => t.category === activeCategory);
    if (!q) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }, [query, activeCategory, grouped]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-card border-b p-6">
          <DialogHeader className="text-left space-y-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold w-fit">
              <BookOpen className="h-3.5 w-3.5" />
              {topics.length} topics · Australian First Aid 5th Edition
            </div>
            <DialogTitle className="font-display text-2xl md:text-3xl">
              Explore the full topic library
            </DialogTitle>
            <DialogDescription>
              Search, filter and preview any first aid topic before you start.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, e.g. CPR, burns, snake bite…"
              className="pl-9 h-11 bg-background"
            />
          </div>

          {/* Category chips */}
          <ScrollArea className="mt-4">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => {
                const Icon = cat === "All" ? BookOpen : categoryIcon(cat);
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Results grid */}
        <ScrollArea className="max-h-[55vh]">
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  No topics match "{query}". Try a different keyword.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((t) => {
                  const Icon = categoryIcon(t.category);
                  return (
                    <Link
                      key={t.slug}
                      to={`/topics/${t.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="group relative p-4 rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-sm leading-tight mb-0.5">
                            {t.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 font-normal"
                          >
                            {t.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {t.summary}
                      </p>
                      <div className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Open topic <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-muted/30 px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            of {topics.length} topics
          </p>
          <Button asChild size="sm" variant="ghost">
            <Link to="/topics" onClick={() => onOpenChange(false)}>
              See full library <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
