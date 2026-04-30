export type Pillar = "immediate" | "financial" | "housing" | "emotional" | "business";

export type Program = {
  id: string;
  provider: string;
  name: string;
  amount: string;
  description: string;
  url: string;
  pillar: Pillar;
  // Matching tags
  tags: {
    disasters?: ("bushfire" | "flood" | "storm" | "cyclone" | "landslide" | "other")[];
    needs?: ("cash" | "food" | "shelter" | "income" | "rebuild" | "counselling" | "business" | "insurance")[];
    audiences?: ("individual" | "family" | "renter" | "homeowner" | "business" | "anyone")[];
    income?: ("any" | "lost-income")[];
    homeImpact?: ("none" | "damaged" | "uninhabitable" | "destroyed")[];
  };
};

export const programs: Program[] = [
  {
    id: "agdrp",
    provider: "Services Australia",
    name: "Australian Government Disaster Recovery Payment (AGDRP)",
    amount: "$1,000 per adult / $400 per child",
    description:
      "One-off, non-means-tested payment for people significantly affected by a declared disaster.",
    url: "https://www.servicesaustralia.gov.au/australian-government-disaster-recovery-payment",
    pillar: "financial",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["cash"],
      audiences: ["individual", "family"],
      homeImpact: ["damaged", "uninhabitable", "destroyed"],
    },
  },
  {
    id: "dra",
    provider: "Services Australia",
    name: "Disaster Recovery Allowance",
    amount: "Up to JobSeeker rate for 13 weeks",
    description:
      "Short-term income support for those who lost income as a direct result of a disaster.",
    url: "https://www.servicesaustralia.gov.au/disaster-recovery-allowance",
    pillar: "financial",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["income"],
      audiences: ["individual"],
      income: ["lost-income"],
    },
  },
  {
    id: "verp",
    provider: "Vic Government",
    name: "Victorian Emergency Relief Payment",
    amount: "Up to $640 per adult / $320 per child",
    description:
      "Emergency relief for food, clothing, accommodation and personal items in the first days after a disaster.",
    url: "https://emergencypayments.dffh.vic.gov.au/",
    pillar: "immediate",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["cash", "food", "shelter"],
      audiences: ["individual", "family"],
    },
  },
  {
    id: "tas",
    provider: "Vic Government",
    name: "Temporary Accommodation Support",
    amount: "Up to $42,500 over 16 weeks",
    description:
      "Help with the cost of short-term accommodation while your home is uninhabitable.",
    url: "https://services.dffh.vic.gov.au/personal-hardship-assistance-program",
    pillar: "housing",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide"],
      needs: ["shelter"],
      audiences: ["individual", "family", "renter", "homeowner"],
      homeImpact: ["uninhabitable", "destroyed"],
    },
  },
  {
    id: "rea",
    provider: "Vic Government",
    name: "Re-establishment Assistance",
    amount: "Up to $42,250 per household",
    description:
      "Helps repair or rebuild a damaged primary residence and replace essential items.",
    url: "https://services.dffh.vic.gov.au/personal-hardship-assistance-program",
    pillar: "housing",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide"],
      needs: ["rebuild"],
      audiences: ["homeowner"],
      homeImpact: ["damaged", "uninhabitable", "destroyed"],
    },
  },
  {
    id: "sbrg",
    provider: "Business Victoria",
    name: "Small Business Recovery Grants",
    amount: "$10,000 – $50,000",
    description:
      "Grants to help small businesses with clean-up, repairs and getting back to trading.",
    url: "https://business.vic.gov.au/grants-and-programs",
    pillar: "business",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["business", "rebuild"],
      audiences: ["business"],
    },
  },
  {
    id: "redcross",
    provider: "Red Cross",
    name: "Australian Red Cross Recovery",
    amount: "Free service",
    description:
      "Personal support, outreach and recovery planning from trained volunteers.",
    url: "https://www.redcross.org.au/emergencies/",
    pillar: "emotional",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["counselling"],
      audiences: ["anyone"],
    },
  },
  {
    id: "lifeline",
    provider: "Lifeline Australia",
    name: "Lifeline Crisis Support",
    amount: "Free • 24/7",
    description:
      "Confidential crisis counselling and emotional support — call 13 11 14 anytime.",
    url: "tel:131114",
    pillar: "emotional",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["counselling"],
      audiences: ["anyone"],
    },
  },
  {
    id: "salvos",
    provider: "Salvation Army",
    name: "Salvation Army Emergency Relief",
    amount: "Vouchers / material aid",
    description:
      "Food, clothing, accommodation referrals and emergency assistance.",
    url: "https://www.salvationarmy.org.au/need-help/",
    pillar: "immediate",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["food", "shelter", "cash"],
      audiences: ["anyone"],
    },
  },
  {
    id: "vinnies",
    provider: "Vinnies",
    name: "St Vincent de Paul Assistance",
    amount: "Vouchers / household goods",
    description: "Help with bills, food and household essentials.",
    url: "https://www.vinnies.org.au/findhelp",
    pillar: "immediate",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide", "other"],
      needs: ["food", "cash"],
      audiences: ["anyone"],
    },
  },
  {
    id: "ica",
    provider: "Insurance Council of Australia",
    name: "Insurance Council Disaster Hotline",
    amount: "Free guidance — 1800 734 621",
    description:
      "Help understanding your insurance options after a declared disaster.",
    url: "https://insurancecouncil.com.au/consumers/disaster-hotline/",
    pillar: "housing",
    tags: {
      disasters: ["bushfire", "flood", "storm", "cyclone", "landslide"],
      needs: ["insurance", "rebuild"],
      audiences: ["homeowner", "renter", "business"],
    },
  },
];

export const pillarMeta: Record<
  Pillar,
  { label: string; description: string; color: string }
> = {
  immediate: {
    label: "Immediate",
    description: "Emergency cash, food, shelter — for the first 72 hours.",
    color: "hsl(var(--pillar-immediate))",
  },
  financial: {
    label: "Financial",
    description: "Disaster payments, income support and grants.",
    color: "hsl(var(--pillar-financial))",
  },
  housing: {
    label: "Housing",
    description: "Temporary accommodation, repairs and re-establishment.",
    color: "hsl(var(--pillar-housing))",
  },
  emotional: {
    label: "Emotional",
    description: "Counselling, recovery centres and human connection.",
    color: "hsl(var(--pillar-emotional))",
  },
  business: {
    label: "Business",
    description: "Grants and recovery support for small businesses.",
    color: "hsl(var(--pillar-financial))",
  },
};
