
-- ─────────────────────────────────────────────
-- 1. webhook_events (idempotency)
-- ─────────────────────────────────────────────
CREATE TABLE public.webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_webhook_id TEXT UNIQUE NOT NULL,
  shopify_event_id TEXT,
  shopify_topic TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_no_client ON public.webhook_events FOR ALL USING (FALSE) WITH CHECK (FALSE);

-- ─────────────────────────────────────────────
-- 2. assessment_attempts
-- ─────────────────────────────────────────────
CREATE TABLE public.assessment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_slug TEXT NOT NULL,
  score INTEGER,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_assessment_attempts_user_program ON public.assessment_attempts (user_id, program_slug);
GRANT SELECT, INSERT ON public.assessment_attempts TO authenticated;
GRANT ALL ON public.assessment_attempts TO service_role;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_attempts_owner_read ON public.assessment_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY assessment_attempts_owner_insert ON public.assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 3. program_completions (source of truth for eligibility)
-- ─────────────────────────────────────────────
CREATE TABLE public.program_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_slug TEXT NOT NULL,
  passed_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER,
  UNIQUE (user_id, program_slug)
);
CREATE INDEX idx_program_completions_user_program ON public.program_completions (user_id, program_slug);
GRANT SELECT ON public.program_completions TO authenticated;
GRANT ALL ON public.program_completions TO service_role;
ALTER TABLE public.program_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY completions_owner_read ON public.program_completions FOR SELECT USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 4. certificate_eligibility_tokens
-- Only the SHA-256 HMAC hash is stored — never raw token
-- ─────────────────────────────────────────────
CREATE TABLE public.certificate_eligibility_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_slug TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_eligibility_tokens_hash ON public.certificate_eligibility_tokens (token_hash);
GRANT ALL ON public.certificate_eligibility_tokens TO service_role;
ALTER TABLE public.certificate_eligibility_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY eligibility_tokens_no_client ON public.certificate_eligibility_tokens FOR ALL USING (FALSE) WITH CHECK (FALSE);

-- ─────────────────────────────────────────────
-- 5. shopify_certificate_jobs
-- ─────────────────────────────────────────────
CREATE TABLE public.shopify_certificate_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_order_id TEXT NOT NULL,
  shopify_line_item_id TEXT NOT NULL,
  shopify_webhook_id TEXT REFERENCES public.webhook_events(shopify_webhook_id),
  customer_email TEXT NOT NULL,
  customer_first_name TEXT,
  customer_last_name TEXT,
  program_slug TEXT NOT NULL,
  program_name TEXT,
  user_id UUID,
  eligibility_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','generating','complete','failed','cancelled')),
  error_message TEXT,
  certificate_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (shopify_order_id, shopify_line_item_id, program_slug)
);
CREATE INDEX idx_shopify_cert_jobs_status ON public.shopify_certificate_jobs (status);
CREATE INDEX idx_shopify_cert_jobs_order  ON public.shopify_certificate_jobs (shopify_order_id);
CREATE TRIGGER shopify_cert_jobs_set_updated_at BEFORE UPDATE ON public.shopify_certificate_jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT ALL ON public.shopify_certificate_jobs TO service_role;
ALTER TABLE public.shopify_certificate_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY shopify_cert_jobs_no_client ON public.shopify_certificate_jobs FOR ALL USING (FALSE) WITH CHECK (FALSE);

-- ─────────────────────────────────────────────
-- 6. shopify_certificates (issued paid certificates)
-- ─────────────────────────────────────────────
CREATE TABLE public.shopify_certificates (
  certificate_id TEXT PRIMARY KEY,
  job_id UUID REFERENCES public.shopify_certificate_jobs(id),
  user_id UUID,
  learner_name TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  program_name TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  cpd_hours INTEGER,
  shopify_order_id TEXT NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued','revoked','refunded','expired','superseded')),
  expires_at TIMESTAMPTZ NULL,
  certificate_template_version TEXT DEFAULT 'v1',
  program_version TEXT,
  cpd_disclaimer_version TEXT DEFAULT 'v1',
  revocation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_shopify_certificates_status ON public.shopify_certificates (status);
CREATE INDEX idx_shopify_certificates_user   ON public.shopify_certificates (user_id);
GRANT SELECT ON public.shopify_certificates TO authenticated;
GRANT ALL ON public.shopify_certificates TO service_role;
ALTER TABLE public.shopify_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY shopify_certificates_owner_read ON public.shopify_certificates FOR SELECT USING (user_id = auth.uid());

-- Public verification helper — returns only safe public fields, never PDF URL or full name
CREATE OR REPLACE FUNCTION public.verify_shopify_certificate(_certificate_id TEXT)
RETURNS TABLE (
  certificate_id TEXT,
  program_name TEXT,
  learner_initial TEXT,
  issue_date TEXT,
  completion_date TEXT,
  status TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.certificate_id,
    c.program_name,
    LEFT(c.learner_name, 1) AS learner_initial,
    c.issue_date,
    c.completion_date,
    c.status
  FROM public.shopify_certificates c
  WHERE c.certificate_id = _certificate_id
    AND c.status = 'issued'
$$;
GRANT EXECUTE ON FUNCTION public.verify_shopify_certificate(TEXT) TO anon, authenticated;

-- ─────────────────────────────────────────────
-- 7. route_catalogue (private base table) + public_route_catalogue view
-- ─────────────────────────────────────────────
CREATE TABLE public.route_catalogue (
  id TEXT PRIMARY KEY,
  route_slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  vendor TEXT,
  image_url TEXT,
  route_type TEXT,
  cta_label TEXT,
  confidence TEXT,
  country TEXT,
  destination_url TEXT,
  partner_entity TEXT,
  referral_code TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  availability_status TEXT DEFAULT 'available',
  related_program TEXT,
  last_checked_at DATE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_route_catalogue_program_country_status ON public.route_catalogue (related_program, country, availability_status);
CREATE INDEX idx_route_catalogue_route_slug             ON public.route_catalogue (route_slug);
GRANT ALL ON public.route_catalogue TO service_role;
ALTER TABLE public.route_catalogue ENABLE ROW LEVEL SECURITY;
CREATE POLICY route_catalogue_no_client ON public.route_catalogue FOR ALL USING (FALSE) WITH CHECK (FALSE);

CREATE VIEW public.public_route_catalogue AS
SELECT id, route_slug, title, description, vendor, image_url, route_type,
       cta_label, confidence, country, partner_entity, availability_status,
       related_program, last_checked_at, synced_at
FROM public.route_catalogue;
GRANT SELECT ON public.public_route_catalogue TO anon, authenticated;

-- ─────────────────────────────────────────────
-- 8. route_clicks
-- ─────────────────────────────────────────────
CREATE TABLE public.route_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  click_id TEXT UNIQUE NOT NULL,
  route_slug TEXT NOT NULL,
  partner_slug TEXT,
  destination_url TEXT,
  country TEXT,
  source_page TEXT,
  session_id TEXT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_route_clicks_slug_ts ON public.route_clicks (route_slug, "timestamp" DESC);
GRANT ALL ON public.route_clicks TO service_role;
ALTER TABLE public.route_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY route_clicks_no_client ON public.route_clicks FOR ALL USING (FALSE) WITH CHECK (FALSE);
