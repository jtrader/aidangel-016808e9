CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.educator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL UNIQUE,
  who_text text,
  how_text text,
  what_text text,
  why_text text,
  qas jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_url text,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.educator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view educator profiles"
ON public.educator_profiles FOR SELECT USING (true);

CREATE POLICY "Admins manage educator profiles"
ON public.educator_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_educator_profiles_updated_at
BEFORE UPDATE ON public.educator_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_educator_profiles_educator_id ON public.educator_profiles(educator_id);