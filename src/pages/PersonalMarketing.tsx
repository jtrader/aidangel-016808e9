import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  User,
  BookOpen,
  Award,
  HeartPulse,
  ArrowRight,
  Building2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SeoHead } from "@/components/SeoHead";
import NetworkFooter from "@/components/NetworkFooter";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { optimizeSupabaseImage } from "@/lib/imageOptimization";
import { useShopifyCheckout } from "@/hooks/useShopifyCheckout";
import EnrolAuthDialog from "@/components/EnrolAuthDialog";
import { useNavigate } from "react-router-dom";
import { CmsPageRenderer } from "@/components/CmsPageRenderer";

const TIERS = [
  {
    name: "Single Credit",
    priceId: "personal_individual_annual",
    price: "AU$25",
    unit: "/ year",
    seats: "1 certificate credit (save $4)",
    popular: false,
    features: [
      "1 CPD-certified certificate credit",
      "Use it on any course once you pass the quiz",
      "Cheaper than buying a single certificate on its own",
      "Credit valid for 12 months",
    ],
  },
  {
    name: "Household 3-Pack",
    priceId: "personal_family_annual",
    price: "AU$60",
    unit: "/ year",
    seats: "3 certificate credits ($20 ea)",
    popular: true,
    features: [
      "3 CPD-certified certificate credits",
      "Share with colleagues, friends or family",
      "Save $27 vs. buying single certificates",
      "Credits valid for 12 months",
    ],
  },
  {
    name: "Family 5-Pack",
    priceId: "personal_family_plus_annual",
    price: "AU$90",
    unit: "/ year",
    seats: "5 certificate credits ($18 ea)",
    popular: false,
    features: [
      "5 CPD-certified certificate credits",
      "Ideal for larger groups",
      "Save $55 vs. buying single certificates",
      "Priority email support",
    ],
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "All courses are free, forever",
    body: "Watch the lessons, take the quizzes, and use the Live CPR Guide and AED Finder — no payment, no sign-up wall. Pay only when you want a CPD certificate.",
  },
  {
    icon: Award,
    title: "CPD certificate on completion — AU$29",
    body: "Pass the quiz and unlock a CPD-certified personal certificate of completion based on the St John Australian First Aid 5th Edition. Buy a single certificate or save with a credit pack below.",
  },
  {
    icon: HeartPulse,
    title: "Be ready when it matters",
    body: "Practice with our Live CPR Guide, AED Finder and step-by-step emergency walkthroughs — designed for real-world moments.",
  },
];


type TopicCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  level: string;
  duration_minutes: number;
};

type CourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
};

export default function PersonalMarketing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startHref = user ? "/programs" : "/auth?redirect=/programs";
  const { openCheckout, loading: checkoutLoading } = useShopifyCheckout();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicCard[]>([]);
  const [courses, setCourses] = useState<CourseCard[]>([]);

  const handleBuy = (priceId: string) => {
    if (!user) {
      setPendingPriceId(priceId);
      setAuthDialogOpen(true);
      return;
    }
    openCheckout({
      priceId,
      customerEmail: user.email ?? undefined,
      customData: { userId: user.id },
      successUrl: `${window.location.origin}/checkout/success`,
    });
  };
  const onAuthSuccess = () => {
    if (pendingPriceId) {
      openCheckout({ priceId: pendingPriceId });
      setPendingPriceId(null);
    }
  };


  useEffect(() => {
    supabase
      .from("courses")
      .select("id,slug,title,summary,cover_url,level,duration_minutes")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setTopics((data as TopicCard[]) ?? []));
    supabase
      .from("programs")
      .select("id,slug,title,summary,cover_url")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCourses((data as CourseCard[]) ?? []));
  }, []);

  const topicsWithCovers = topics.filter((t) => !!t.cover_url);
  const topicsTrack =
    topicsWithCovers.length > 0
      ? [...topicsWithCovers, ...topicsWithCovers, ...topicsWithCovers]
      : [];

  const coursesWithCovers = courses.filter((c) => !!c.cover_url);
  const coursesTrack =
    coursesWithCovers.length > 0
      ? [...coursesWithCovers, ...coursesWithCovers, ...coursesWithCovers]
      : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader backTo="/" backLabel="Home" />
      <SeoHead
        lang="en"
        basePath="/personal"
        title="Free First Aid Courses + CPD Certificates | First Aid Angel"
        description="All First Aid Angel courses are free. Earn a CPD-certified personal certificate of completion for AU$29 — or save with a credit pack from AU$25."
      />

      <CmsPageRenderer
        slug="personal"
        fallback={
          <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#F7F7F7] to-card border-b">
        <div className="container max-w-6xl mx-auto px-4 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <User className="h-4 w-4" /> First Aid Angel — Free for Everyone
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            All First Aid courses are{" "}
            <span className="text-primary">100% free</span>.
            <br />
            Pay only for your CPD certificate.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Watch every lesson, take every quiz and use the Live CPR Guide and AED Finder at no cost. When you pass, unlock a CPD-certified personal certificate of completion for just <strong>AU$29</strong> — or save with a credit pack below.
          </p>
          <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Not a substitute for accredited hands-on training</p>
                <p>
                  These short courses are designed for essential general knowledge, continuing professional development (CPD), and as a study guide for accredited in-person training. They do not replace official hands-on training accreditation.
                </p>
                <p className="mt-2">
                  Find official accreditation education providers in our <Link to="/learn" className="underline font-medium hover:text-amber-700">Educators directory</Link>.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to={startHref}>
                Start learning free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            No subscription. No paywall on lessons. Pay AU$29 per certificate, or save with a credit pack.
          </p>
        </div>


        {/* Auto-scrolling courses marquee (programs) */}
        {coursesTrack.length > 0 && (
          <div
            id="courses-marquee"
            className="relative pb-12 pt-2 overflow-hidden scroll-mt-24"
            aria-label="Browse first aid courses"
          >
            <style>{`
              @keyframes coursesMarquee {
                from { transform: translateX(0); }
                to { transform: translateX(-33.3333%); }
              }
              .courses-marquee-track {
                animation: coursesMarquee 60s linear infinite;
                width: max-content;
              }
              .courses-marquee-track:hover { animation-play-state: paused; }
              @media (prefers-reduced-motion: reduce) {
                .courses-marquee-track { animation: none; }
              }
            `}</style>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F7F7F7] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent z-10" />
            <div className="flex courses-marquee-track gap-4 px-4">
              {coursesTrack.map((c, i) => {
                const isEager = i < 3;
                return (
                <Link
                  key={`${c.id}-${i}`}
                  to={`/programs/${c.slug}`}
                  className="block group shrink-0 w-64"
                >
                  <Card className="overflow-hidden rounded-2xl h-full hover:shadow-lg transition-shadow bg-card">
                    <div className="aspect-video bg-muted relative">
                      {c.cover_url ? (
                        <img
                          src={optimizeSupabaseImage(c.cover_url, 768, 80)}
                          alt={c.title}
                          width={768}
                          height={432}
                          loading={isEager ? "eager" : "lazy"}
                          fetchPriority={isEager ? "high" : "auto"}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{c.title}</h3>
                      {c.summary && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.summary}</p>}
                    </div>
                  </Card>
                </Link>
              )})}
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-14 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6 rounded-2xl border-border bg-card h-full">
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">{f.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      {topicsTrack.length > 0 && (
        <section className="py-12 bg-muted/30 border-y overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4 mb-6 text-center">
            <Badge variant="secondary" className="mb-3">Free topics</Badge>
            <h2 className="font-display text-3xl font-bold">Learn practical first aid skills</h2>
            <p className="text-muted-foreground mt-2">Every lesson and quiz is free to access.</p>
          </div>
          <style>{`
            @keyframes topicsMarquee {
              from { transform: translateX(-33.3333%); }
              to { transform: translateX(0); }
            }
            .topics-marquee-track {
              animation: topicsMarquee 70s linear infinite;
              width: max-content;
            }
            .topics-marquee-track:hover { animation-play-state: paused; }
            @media (prefers-reduced-motion: reduce) {
              .topics-marquee-track { animation: none; }
            }
          `}</style>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-muted/30 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/30 to-transparent z-10" />
            <div className="flex topics-marquee-track gap-4 px-4 pb-2">
              {topicsTrack.map((t, i) => {
                const isEager = i < 3;
                return (
                <Link key={`${t.id}-${i}`} to={`/topics/${t.slug}`} className="block group shrink-0 w-56">
                  <Card className="overflow-hidden rounded-2xl bg-card hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-video bg-muted">
                      {t.cover_url && (
                        <img
                          src={optimizeSupabaseImage(t.cover_url, 640, 80)}
                          alt={t.title}
                          width={640}
                          height={360}
                          loading={isEager ? "eager" : "lazy"}
                          fetchPriority={isEager ? "high" : "auto"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{t.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {t.duration_minutes || 10} min
                      </div>
                    </div>
                  </Card>
                </Link>
              )})}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-16 px-4 bg-card border-y" id="certificates">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/10">Certificate credits</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Get CPD-certified when you're ready</h2>
            <p className="text-muted-foreground">
              Training stays free. Certificate credits let you unlock official personal completion certificates after passing quizzes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <Card key={tier.priceId} className={`relative p-6 rounded-2xl ${tier.popular ? "border-primary shadow-lg" : "border-border"}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Best value</Badge>
                )}
                <h3 className="font-display text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.seats}</p>
                <div className="mb-5">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm"> {tier.unit}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  disabled={checkoutLoading}
                  onClick={() => handleBuy(tier.priceId)}
                >
                  {checkoutLoading ? "Opening…" : user ? "Buy credits" : "Sign in to buy"}
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Certificate credits are for personal learning certificates only. For workplace teams, see our employer platform.
          </p>
        </div>
      </section>

      {/* Workplace cross-sell */}
      <section className="py-14 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card className="p-6 md:p-8 rounded-2xl bg-primary/5 border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Need certificates for a workplace?</h2>
                  <p className="text-muted-foreground">
                    Invite staff, assign courses and manage completion records with organisation seats and admin dashboards.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link to="/employer">For employers</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      </>
        }
      />

      <NetworkFooter />
      <EnrolAuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}
