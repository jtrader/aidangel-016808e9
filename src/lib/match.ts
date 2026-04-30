import { programs, type Program } from "@/data/programs";

export type Answers = {
  disaster: "bushfire" | "flood" | "storm" | "cyclone" | "landslide" | "other";
  homeImpact: "none" | "damaged" | "uninhabitable" | "destroyed";
  income: "any" | "lost-income";
  audience: "individual" | "family" | "renter" | "homeowner" | "business";
  needs: ("cash" | "food" | "shelter" | "income" | "rebuild" | "counselling" | "business" | "insurance")[];
};

export function matchPrograms(answers: Answers): Program[] {
  return programs
    .map((p) => ({ p, score: scoreProgram(p, answers) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

function scoreProgram(p: Program, a: Answers): number {
  let score = 0;
  const t = p.tags;

  // Disaster type — required
  if (t.disasters && !t.disasters.includes(a.disaster)) return 0;
  score += 1;

  // Audience match
  if (t.audiences) {
    if (t.audiences.includes("anyone")) score += 1;
    else if (t.audiences.includes(a.audience)) score += 2;
    else if (a.audience === "family" && t.audiences.includes("individual")) score += 1;
  }

  // Income match
  if (t.income?.includes("lost-income") && a.income === "lost-income") score += 3;
  if (t.income?.includes("lost-income") && a.income === "any") return 0;

  // Home impact
  if (t.homeImpact) {
    if (t.homeImpact.includes(a.homeImpact)) score += 3;
    else return 0;
  }

  // Needs overlap
  if (t.needs && a.needs.length) {
    const overlap = t.needs.filter((n) => a.needs.includes(n)).length;
    score += overlap * 2;
  }

  return score;
}
