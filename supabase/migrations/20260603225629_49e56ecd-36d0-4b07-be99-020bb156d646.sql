
-- ============================================================
-- LoveKey HELP Network — locale_packs foundation (Phase 1.3)
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. locale_packs
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT UNIQUE NOT NULL,
  locale_name TEXT NOT NULL,
  locale_type TEXT NOT NULL
    CHECK (locale_type IN ('country','state_region','council','city','community','organisation')),
  parent_locale_id TEXT REFERENCES public.locale_packs(locale_id),
  country_code TEXT NOT NULL,
  currency TEXT,
  primary_language TEXT,
  secondary_languages TEXT[],
  timezone TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','candidate','verified','published','needs_review','archived')),
  confidence TEXT NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low','medium','high','unknown')),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_packs TO anon, authenticated;
GRANT ALL ON public.locale_packs TO service_role;
ALTER TABLE public.locale_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY locale_packs_public_read ON public.locale_packs
  FOR SELECT USING (status = 'published');

-- ─────────────────────────────────────────────
-- 2. locale_emergency_contacts
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT NOT NULL REFERENCES public.locale_packs(locale_id) ON DELETE CASCADE,
  service_type TEXT NOT NULL
    CHECK (service_type IN ('primary','ambulance','fire','police','ses','coastguard',
                            'non_emergency_police','non_emergency_health','text_emergency')),
  number TEXT NOT NULL,
  label TEXT,
  notes TEXT,
  last_checked_at DATE,
  confidence TEXT NOT NULL DEFAULT 'high',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_emergency_contacts TO anon, authenticated;
GRANT ALL ON public.locale_emergency_contacts TO service_role;
ALTER TABLE public.locale_emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY emergency_contacts_public_read ON public.locale_emergency_contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.locale_packs lp
            WHERE lp.locale_id = locale_emergency_contacts.locale_id
              AND lp.status = 'published')
  );

-- ─────────────────────────────────────────────
-- 3. locale_warning_sources
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_warning_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT NOT NULL REFERENCES public.locale_packs(locale_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  source_type TEXT,
  authority_level TEXT
    CHECK (authority_level IN ('official','verified','candidate','low_confidence','unknown')),
  crisis_types TEXT[],
  region TEXT,
  last_checked_at DATE,
  confidence TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_warning_sources TO anon, authenticated;
GRANT ALL ON public.locale_warning_sources TO service_role;
ALTER TABLE public.locale_warning_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY warning_sources_public_read ON public.locale_warning_sources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.locale_packs lp
            WHERE lp.locale_id = locale_warning_sources.locale_id
              AND lp.status = 'published')
  );

-- ─────────────────────────────────────────────
-- 4. locale_crisis_lines
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_crisis_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT NOT NULL REFERENCES public.locale_packs(locale_id) ON DELETE CASCADE,
  service_slug TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  url TEXT,
  description TEXT,
  availability TEXT,
  cost TEXT DEFAULT 'free',
  audience TEXT,
  last_checked_at DATE,
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_crisis_lines TO anon, authenticated;
GRANT ALL ON public.locale_crisis_lines TO service_role;
ALTER TABLE public.locale_crisis_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY crisis_lines_public_read ON public.locale_crisis_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.locale_packs lp
            WHERE lp.locale_id = locale_crisis_lines.locale_id
              AND lp.status = 'published')
  );

-- ─────────────────────────────────────────────
-- 5. locale_trusted_entities
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_trusted_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT NOT NULL REFERENCES public.locale_packs(locale_id) ON DELETE CASCADE,
  entity_type TEXT
    CHECK (entity_type IN ('st_john','red_cross','amazon','nhs','fema','nema',
                           'civil_defence','national_health','other')),
  name TEXT NOT NULL,
  official_website TEXT,
  shop_url TEXT,
  training_url TEXT,
  recovery_url TEXT,
  status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','verified_public_route','referral_partner',
                      'commercial_partner','integrated_partner','archived')),
  last_checked_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_trusted_entities TO anon, authenticated;
GRANT ALL ON public.locale_trusted_entities TO service_role;
ALTER TABLE public.locale_trusted_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY trusted_entities_public_read ON public.locale_trusted_entities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.locale_packs lp
            WHERE lp.locale_id = locale_trusted_entities.locale_id
              AND lp.status = 'published')
  );

-- ─────────────────────────────────────────────
-- 6. locale_recovery_programs
-- ─────────────────────────────────────────────
CREATE TABLE public.locale_recovery_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale_id TEXT NOT NULL REFERENCES public.locale_packs(locale_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  disaster_types TEXT[],
  support_categories TEXT[],
  application_url TEXT,
  eligibility_summary TEXT,
  eligibility_disclaimer TEXT
    DEFAULT 'Eligibility is determined solely by the official provider. This information is a guide only.',
  last_checked_at DATE,
  confidence TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locale_recovery_programs TO anon, authenticated;
GRANT ALL ON public.locale_recovery_programs TO service_role;
ALTER TABLE public.locale_recovery_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY recovery_programs_public_read ON public.locale_recovery_programs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.locale_packs lp
            WHERE lp.locale_id = locale_recovery_programs.locale_id
              AND lp.status = 'published')
  );

-- ─────────────────────────────────────────────
-- 7. source_registry (admin-only)
-- ─────────────────────────────────────────────
CREATE TABLE public.source_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  source_type TEXT
    CHECK (source_type IN ('official_government','emergency_authority','local_council',
                           'ngo','charity','red_cross','st_john','health_service',
                           'community_service','affiliate_partner','commercial_partner',
                           'directory','manual_research')),
  authority_level TEXT
    CHECK (authority_level IN ('official','verified','candidate','low_confidence','unknown')),
  related_help_stage TEXT,
  locale_id TEXT REFERENCES public.locale_packs(locale_id),
  last_checked_at DATE,
  check_frequency TEXT DEFAULT 'quarterly',
  confidence TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.source_registry TO service_role;
ALTER TABLE public.source_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY source_registry_admin_only ON public.source_registry
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ─────────────────────────────────────────────
-- 8. route_disclosures
-- ─────────────────────────────────────────────
CREATE TABLE public.route_disclosures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disclosure_id TEXT UNIQUE NOT NULL,
  locale_id TEXT REFERENCES public.locale_packs(locale_id),
  disclosure_type TEXT
    CHECK (disclosure_type IN ('affiliate','referral','sponsored','partner','none')),
  short_text TEXT NOT NULL,
  full_text TEXT,
  applies_to_route_types TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.route_disclosures TO anon, authenticated;
GRANT ALL ON public.route_disclosures TO service_role;
ALTER TABLE public.route_disclosures ENABLE ROW LEVEL SECURITY;
CREATE POLICY route_disclosures_public_read ON public.route_disclosures
  FOR SELECT USING (active = TRUE);

-- ─────────────────────────────────────────────
-- 9. lk_translation_status (renamed to avoid clashing with anything existing)
-- ─────────────────────────────────────────────
CREATE TABLE public.lk_translation_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  locale_id TEXT REFERENCES public.locale_packs(locale_id),
  language_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','machine_generated','human_reviewed','published','archived')),
  translator TEXT,
  reviewed_by TEXT,
  published_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_type, content_id, language_code)
);
GRANT SELECT ON public.lk_translation_status TO anon, authenticated;
GRANT ALL ON public.lk_translation_status TO service_role;
ALTER TABLE public.lk_translation_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY translation_status_public_read ON public.lk_translation_status
  FOR SELECT USING (status IN ('human_reviewed','published'));

-- ─────────────────────────────────────────────
-- 10. lk_audit_log (admin-only)
-- ─────────────────────────────────────────────
CREATE TABLE public.lk_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  before_value JSONB,
  after_value JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.lk_audit_log TO service_role;
ALTER TABLE public.lk_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_admin_only ON public.lk_audit_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_locale_packs_country    ON public.locale_packs (country_code);
CREATE INDEX idx_locale_packs_status     ON public.locale_packs (status);
CREATE INDEX idx_locale_packs_parent     ON public.locale_packs (parent_locale_id);
CREATE INDEX idx_emergency_locale        ON public.locale_emergency_contacts (locale_id, service_type);
CREATE INDEX idx_warning_locale          ON public.locale_warning_sources (locale_id);
CREATE INDEX idx_crisis_lines_locale     ON public.locale_crisis_lines (locale_id);
CREATE INDEX idx_crisis_lines_slug       ON public.locale_crisis_lines (service_slug);
CREATE INDEX idx_trusted_entities_locale ON public.locale_trusted_entities (locale_id, entity_type);
CREATE INDEX idx_recovery_locale         ON public.locale_recovery_programs (locale_id);
CREATE INDEX idx_source_registry_locale  ON public.source_registry (locale_id);
CREATE INDEX idx_lk_translation_status   ON public.lk_translation_status (content_type, content_id, language_code);

-- ─────────────────────────────────────────────
-- updated_at triggers (reuse public.touch_updated_at)
-- ─────────────────────────────────────────────
CREATE TRIGGER trg_locale_packs_updated              BEFORE UPDATE ON public.locale_packs              FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_emergency_contacts_updated        BEFORE UPDATE ON public.locale_emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_warning_sources_updated           BEFORE UPDATE ON public.locale_warning_sources    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_crisis_lines_updated              BEFORE UPDATE ON public.locale_crisis_lines       FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_trusted_entities_updated          BEFORE UPDATE ON public.locale_trusted_entities   FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_recovery_programs_updated         BEFORE UPDATE ON public.locale_recovery_programs  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_source_registry_updated           BEFORE UPDATE ON public.source_registry           FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_route_disclosures_updated         BEFORE UPDATE ON public.route_disclosures         FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_lk_translation_status_updated     BEFORE UPDATE ON public.lk_translation_status     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
