// LoveKey HELP Network — locale pack data accessors
// [SHARED] — copy unchanged to Crisis Compass, Guardian Guide, AidAngel.
//
// Reads from public locale_* tables via the anon key (RLS-protected).
// NEVER hardcodes emergency numbers, service URLs, or trusted entities here —
// everything comes from the database so other sites in the network reuse the
// same source of truth.

import { supabase } from '@/integrations/supabase/client';
import { normaliseLocale } from '@/lib/localeCodes';

export type EmergencyContact = {
  id: string;
  locale_id: string;
  service_type:
    | 'primary' | 'ambulance' | 'fire' | 'police' | 'ses' | 'coastguard'
    | 'non_emergency_police' | 'non_emergency_health' | 'text_emergency';
  number: string;
  label: string | null;
  notes: string | null;
  confidence: 'low' | 'medium' | 'high' | 'unknown';
};

export type CrisisLine = {
  id: string;
  locale_id: string;
  service_slug: string | null;
  name: string;
  phone: string | null;
  url: string | null;
  description: string | null;
  availability: string | null;
  cost: string | null;
  audience: string | null;
};

export type TrustedEntity = {
  id: string;
  locale_id: string;
  entity_type: string;
  name: string;
  official_website: string | null;
  shop_url: string | null;
  training_url: string | null;
  recovery_url: string | null;
  status: string;
};

export type RouteDisclosure = {
  id: string;
  disclosure_id: string;
  locale_id: string | null;
  disclosure_type: 'affiliate' | 'referral' | 'sponsored' | 'partner' | 'none';
  short_text: string;
  full_text: string | null;
  applies_to_route_types: string[] | null;
  active: boolean;
};

/**
 * Sentinel returned when no locale-specific number is found AND no caller-supplied
 * fallback exists. UI must render: "Emergency number unavailable for this region."
 */
export const EMERGENCY_UNAVAILABLE = 'unavailable' as const;

/**
 * Returns the primary emergency number for a locale.
 *
 * Rule 2 (no global fallback): there is NO hardcoded global default.
 * For Australian pages only, callers may explicitly pass `'000'` as fallback.
 * For shared / international components, omit the fallback — the UI must
 * handle the `'unavailable'` sentinel.
 */
export async function getEmergencyNumber(
  localeId: string,
  fallback?: string,
): Promise<string> {
  const id = normaliseLocale(localeId);
  if (!id) return fallback ?? EMERGENCY_UNAVAILABLE;
  try {
    const { data } = await supabase
      .from('locale_emergency_contacts')
      .select('number')
      .eq('locale_id', id)
      .eq('service_type', 'primary')
      .order('confidence', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.number) return data.number;
  } catch {
    /* fall through */
  }
  return fallback ?? EMERGENCY_UNAVAILABLE;
}

export async function getAllEmergencyContacts(localeId: string): Promise<EmergencyContact[]> {
  const id = normaliseLocale(localeId);
  if (!id) return [];
  const { data } = await supabase
    .from('locale_emergency_contacts')
    .select('*')
    .eq('locale_id', id)
    .order('service_type');
  return (data ?? []) as EmergencyContact[];
}

export async function getCrisisLines(localeId: string, audience?: string): Promise<CrisisLine[]> {
  const id = normaliseLocale(localeId);
  if (!id) return [];
  let q = supabase.from('locale_crisis_lines').select('*').eq('locale_id', id);
  if (audience) q = q.eq('audience', audience);
  const { data } = await q;
  return (data ?? []) as CrisisLine[];
}

export async function getTrustedEntity(
  localeId: string,
  entityType: string,
): Promise<TrustedEntity | null> {
  const id = normaliseLocale(localeId);
  if (!id) return null;
  const { data } = await supabase
    .from('locale_trusted_entities')
    .select('*')
    .eq('locale_id', id)
    .eq('entity_type', entityType)
    .maybeSingle();
  return (data ?? null) as TrustedEntity | null;
}

export async function getRouteDisclosure(
  localeId: string,
  routeType: string,
): Promise<RouteDisclosure | null> {
  const id = normaliseLocale(localeId);
  if (!id) return null;
  const { data } = await supabase
    .from('route_disclosures')
    .select('*')
    .eq('locale_id', id)
    .eq('active', true)
    .contains('applies_to_route_types', [routeType])
    .limit(1)
    .maybeSingle();
  return (data ?? null) as RouteDisclosure | null;
}
