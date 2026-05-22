import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "faa.sid";

function sessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "no-session";
  }
}

export type GiveClickPayload = {
  ngoId: string;
  countryCode: string;
  countryName: string;
  destinationUrl: string;
  isNational: boolean;
  language: string;
  variant?: "header" | "footer" | string;
};

/**
 * Records a Give-button click. Event name is `give_click` to match the
 * renamed UI label. Fire-and-forget; never blocks the navigation.
 */
export function trackGiveClick(p: GiveClickPayload): void {
  recordClick("give_click", p);
}

/**
 * Records a Shop-button click into the same `give_clicks` table with a
 * distinct event name so the referral dashboard can filter shop vs give.
 */
export function trackShopClick(p: GiveClickPayload): void {
  recordClick("shop_click", p);
}

/**
 * Records a Learn-referral click (educator booking/website outbound).
 * Uses `ngo_id` to store the educator slug, and `variant` for
 * "booking" | "website" | "profile" so the dashboard can group.
 */
export function trackLearnClick(p: GiveClickPayload): void {
  recordClick("learn_click", p);
}

function recordClick(event: "give_click" | "shop_click" | "learn_click", p: GiveClickPayload): void {
  try {
    const row = {
      event_name: event,
      ngo_id: p.ngoId,
      country_code: p.countryCode,
      country_name: p.countryName,
      destination_url: p.destinationUrl,
      is_national: p.isNational,
      page_path: typeof location !== "undefined" ? location.pathname + location.search : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      language: p.language,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      session_id: sessionId(),
      variant: p.variant ?? null,
    };
    void supabase.from("give_clicks").insert(row);
  } catch {
    /* swallow — analytics must never break the click */
  }
}
