-- Certificate credits ledger
CREATE TABLE public.certificate_credits (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 0,
  unlimited boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'live',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificate_credits TO authenticated;
GRANT ALL ON public.certificate_credits TO service_role;

ALTER TABLE public.certificate_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON public.certificate_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages credits"
  ON public.certificate_credits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER certificate_credits_touch_updated_at
  BEFORE UPDATE ON public.certificate_credits
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Atomic credit consumption (returns true if a credit was deducted or unlimited)
CREATE OR REPLACE FUNCTION public.consume_certificate_credit(_user uuid, _env text DEFAULT 'live')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.certificate_credits;
BEGIN
  SELECT * INTO v_row FROM public.certificate_credits
    WHERE user_id = _user AND environment = _env
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_row.unlimited THEN
    RETURN true;
  END IF;

  IF v_row.balance <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.certificate_credits
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = _user AND environment = _env;

  RETURN true;
END;
$$;

-- One-time grant: convert any existing live subscriptions to credits
INSERT INTO public.certificate_credits (user_id, balance, unlimited, environment)
SELECT
  s.user_id,
  SUM(CASE s.price_id
        WHEN 'personal_individual_annual' THEN 1
        WHEN 'personal_family_annual' THEN 3
        WHEN 'personal_family_plus_annual' THEN 5
        WHEN 'employer_team_25_annual' THEN 25
        WHEN 'employer_team_50_annual' THEN 50
        WHEN 'employer_starter_seat_annual' THEN 10
        WHEN 'certificate_single' THEN 1
        ELSE 0
      END)::int AS balance,
  bool_or(s.price_id = 'employer_workplace_annual') AS unlimited,
  s.environment
FROM public.subscriptions s
WHERE s.status IN ('active','trialing')
GROUP BY s.user_id, s.environment
ON CONFLICT (user_id) DO UPDATE
  SET balance = public.certificate_credits.balance + EXCLUDED.balance,
      unlimited = public.certificate_credits.unlimited OR EXCLUDED.unlimited;