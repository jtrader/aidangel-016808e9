import { createContext, useContext, useState, ReactNode } from "react";

export type LanguageCode = "en" | "kriol" | "yolngu" | "pitjantjatjara" | "arrernte" | "tsi";

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  region: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", region: "Australia-wide" },
  { code: "kriol", name: "Kriol", nativeName: "Kriol", region: "Northern Australia" },
  { code: "yolngu", name: "Yolŋu Matha", nativeName: "Yolŋu Matha", region: "Arnhem Land, NT" },
  { code: "pitjantjatjara", name: "Pitjantjatjara", nativeName: "Pitjantjatjara", region: "Central Australia" },
  { code: "arrernte", name: "Arrernte", nativeName: "Arrernte", region: "Alice Springs region, NT" },
  { code: "tsi", name: "Torres Strait Creole", nativeName: "Yumplatok", region: "Torres Strait Islands, QLD" },
];

type TranslationKey =
  | "emergencyBanner"
  | "appTitle"
  | "appSubtitle"
  | "welcomeHeading"
  | "welcomeDescription"
  | "inputPlaceholder"
  | "disclaimer"
  | "cpr" | "choking" | "burns" | "snakeBite" | "bleeding" | "fracture"
  | "seizure" | "anaphylaxis" | "heartAttack" | "hypothermia" | "eyeInjury" | "electricShock";

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    emergencyBanner: "In a life-threatening emergency, call Triple Zero (000) immediately",
    appTitle: "AidAngel",
    appSubtitle: "Your First Aid Assistant • Powered by Australian First Aid 5th Edition",
    welcomeHeading: "How can I help?",
    welcomeDescription: "Ask me about any first aid situation. I'll provide step-by-step guidance based on the Australian First Aid manual.",
    inputPlaceholder: "Describe your first aid situation...",
    disclaimer: "Not a substitute for professional medical advice. Always call 000 in emergencies.",
    cpr: "CPR", choking: "Choking", burns: "Burns", snakeBite: "Snake Bite",
    bleeding: "Bleeding", fracture: "Fracture", seizure: "Seizure",
    anaphylaxis: "Anaphylaxis", heartAttack: "Heart Attack", hypothermia: "Hypothermia",
    eyeInjury: "Eye Injury", electricShock: "Electric Shock",
  },
  kriol: {
    emergencyBanner: "Wen samwan rili sik o hert, ringap Triple Zero (000) stret",
    appTitle: "AidAngel",
    appSubtitle: "Yu Ferst Aid Helpa",
    welcomeHeading: "Wanim ai gin helpim yu?",
    welcomeDescription: "Askim mi enijing baut ferst aid. Ai gin shoum yu step bai step.",
    inputPlaceholder: "Dalim mi wanim bin heppen...",
    disclaimer: "Dis nomo teik ples bla dokta. Ringap 000 wen imijinsi.",
    cpr: "CPR", choking: "Joking", burns: "Bern", snakeBite: "Sneik Bait",
    bleeding: "Bliding", fracture: "Breikim Boun", seizure: "Fit",
    anaphylaxis: "Bad Allerji", heartAttack: "Hat Etak", hypothermia: "Tu Kol",
    eyeInjury: "Ai Hert", electricShock: "Elektrik Shok",
  },
  yolngu: {
    emergencyBanner: "Ŋunhi buku-ḏäkthun, djamarrkuliw Triple Zero (000) ŋayi",
    appTitle: "AidAngel",
    appSubtitle: "Ŋarraku First Aid Helper",
    welcomeHeading: "Nhä ŋarra djäma?",
    welcomeDescription: "Ŋarrakuŋ dhäwu first aid. Ŋarra yäku djäma step by step.",
    inputPlaceholder: "Dhäwu ŋarrakuŋ nhä buku-ḏäkthun...",
    disclaimer: "Ga dhä-wirrka'yun doctor-wu. Djamarrkuliw 000 ŋunhi buku-ḏäkthun.",
    cpr: "CPR", choking: "Choking", burns: "Wäŋa guḻun'", snakeBite: "Bäpi",
    bleeding: "Ŋayaŋu ŋal'", fracture: "Ŋayaŋu dharpa", seizure: "Fit",
    anaphylaxis: "Buku allerji", heartAttack: "Ŋayaŋu dhärra", hypothermia: "Buku ŋal'marr",
    eyeInjury: "Mil ḏäkthun", electricShock: "Gurrtha shock",
  },
  pitjantjatjara: {
    emergencyBanner: "Uwankara alatjitu pikaringkunytjaku, Triple Zero (000) telephone-angka wangka",
    appTitle: "AidAngel",
    appSubtitle: "Nyuntumpa First Aid Helper",
    welcomeHeading: "Nyaaku ngayulu nyuntunya alpamilantjaku?",
    welcomeDescription: "First aid tjutaku ngayunya tjapina. Step by step ngayulu watjantjaku.",
    inputPlaceholder: "Nyaa puṯi nyuntunya...",
    disclaimer: "Ngangkari tjutaku wanti. 000 wangka emergency-angka.",
    cpr: "CPR", choking: "Choking", burns: "Waru pika", snakeBite: "Liru katantja",
    bleeding: "Milpatjunanyi", fracture: "Tara pakantja", seizure: "Fit",
    anaphylaxis: "Pika puḻka allerji", heartAttack: "Kurrunpa pika", hypothermia: "Wari puḻka",
    eyeInjury: "Kuru pika", electricShock: "Gurrtha shock",
  },
  arrernte: {
    emergencyBanner: "Arelhe atnyeneme apeke, Triple Zero (000) aketyarte ileme",
    appTitle: "AidAngel",
    appSubtitle: "Nhenhe First Aid Helper",
    welcomeHeading: "Nhenhe iwerre ngkwe?",
    welcomeDescription: "First aid-akerte ngkwe ayerneme. Step by step ngkwe tyerre arlkeme.",
    inputPlaceholder: "Nhenhe nthakenhe apenteme...",
    disclaimer: "Doctor-ke ayerneme impene. 000 ileme emergency-kenhe.",
    cpr: "CPR", choking: "Choking", burns: "Ure apenteme", snakeBite: "Apme ketye",
    bleeding: "Atnye anthurre", fracture: "Altye iyerrknge", seizure: "Fit",
    anaphylaxis: "Allerji anthurre", heartAttack: "Atnye irrpentye", hypothermia: "Atnye arenge",
    eyeInjury: "Ante apenteme", electricShock: "Gurrtha shock",
  },
  tsi: {
    emergencyBanner: "Wen big sik or hert, ringap Triple Zero (000) kwiktaim",
    appTitle: "AidAngel",
    appSubtitle: "Yupela First Aid Helpa",
    welcomeHeading: "Wanem mi save helpem yu?",
    welcomeDescription: "Askem mi eni first aid samting. Mi save showem yu step bai step.",
    inputPlaceholder: "Tokem mi wanem bin happen...",
    disclaimer: "Dis nomo teik ples blo dokta. Ringap 000 lo emergency.",
    cpr: "CPR", choking: "Choking", burns: "Burn", snakeBite: "Snake Bite",
    bleeding: "Bleeding", fracture: "Broken Bone", seizure: "Fit",
    anaphylaxis: "Bad Allerji", heartAttack: "Heart Attack", hypothermia: "Too Cold",
    eyeInjury: "Eye Hert", electricShock: "Electric Shock",
  },
};

// Language name mapping for the AI system prompt
export const languageFullName: Record<LanguageCode, string> = {
  en: "English",
  kriol: "Australian Kriol (a creole language spoken across Northern Australia)",
  yolngu: "Yolŋu Matha (spoken in Arnhem Land, Northern Territory)",
  pitjantjatjara: "Pitjantjatjara (spoken in Central Australia, including parts of SA, WA, and NT)",
  arrernte: "Arrernte (spoken in the Alice Springs region, Northern Territory)",
  tsi: "Yumplatok / Torres Strait Creole (spoken in the Torres Strait Islands, Queensland)",
};

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>("en");

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
