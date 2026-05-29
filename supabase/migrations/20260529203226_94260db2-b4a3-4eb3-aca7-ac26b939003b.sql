
-- 1. Restrict consume_certificate_credit to caller's own UID
CREATE OR REPLACE FUNCTION public.consume_certificate_credit(_user uuid, _env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.certificate_credits;
BEGIN
  IF _user <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO v_row FROM public.certificate_credits
    WHERE user_id = _user AND environment = _env
    FOR UPDATE;

  IF NOT FOUND THEN RETURN false; END IF;
  IF v_row.unlimited THEN RETURN true; END IF;
  IF v_row.balance <= 0 THEN RETURN false; END IF;

  UPDATE public.certificate_credits
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = _user AND environment = _env;
  RETURN true;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.consume_certificate_credit(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_certificate_credit(uuid, text) TO authenticated, service_role;

-- 2. Restrict get_claim_statuses to submitter or admin
CREATE OR REPLACE FUNCTION public.get_claim_statuses(claim_ids uuid[])
 RETURNS TABLE(id uuid, status text, created_at timestamp with time zone, review_notes text, reviewed_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT c.id, c.status::text, c.created_at,
    CASE WHEN public.has_role(auth.uid(), 'admin'::app_role) THEN c.review_notes ELSE NULL END,
    c.reviewed_at
  FROM public.educator_claims c
  WHERE c.id = ANY(claim_ids)
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR c.submitter_user_id = auth.uid()
      OR c.claimed_user_id = auth.uid()
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.get_claim_statuses(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_claim_statuses(uuid[]) TO authenticated, service_role;

-- 3. Restrict translation tables to published-parent only
DROP POLICY IF EXISTS "Public read cms page translations" ON public.cms_page_translations;
CREATE POLICY "Public read cms page translations of published pages"
ON public.cms_page_translations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.cms_pages p
  WHERE p.id = cms_page_translations.page_id
    AND (p.is_published OR public.has_role(auth.uid(), 'admin'::app_role))
));

DROP POLICY IF EXISTS "Public read cms block translations" ON public.cms_block_translations;
CREATE POLICY "Public read cms block translations of published pages"
ON public.cms_block_translations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.cms_blocks b
  JOIN public.cms_pages p ON p.id = b.page_id
  WHERE b.id = cms_block_translations.block_id
    AND (p.is_published OR public.has_role(auth.uid(), 'admin'::app_role))
));

DROP POLICY IF EXISTS "Public read course translations" ON public.course_translations;
CREATE POLICY "Public read course translations of published courses"
ON public.course_translations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.courses c
  WHERE c.id = course_translations.course_id
    AND (c.is_published OR public.has_role(auth.uid(), 'admin'::app_role))
));

DROP POLICY IF EXISTS "Public read lesson translations" ON public.lesson_translations;
CREATE POLICY "Public read lesson translations of published courses"
ON public.lesson_translations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = lesson_translations.lesson_id
    AND (c.is_published OR public.has_role(auth.uid(), 'admin'::app_role))
));

-- quiz_question_translations: only restrict if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='quiz_question_translations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public read quiz question translations" ON public.quiz_question_translations';
    EXECUTE $p$
      CREATE POLICY "Public read quiz question translations of published courses"
      ON public.quiz_question_translations FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.quiz_questions q
        JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quiz_question_translations.question_id
          AND (c.is_published OR public.has_role(auth.uid(), 'admin'::app_role))
      ))
    $p$;
  END IF;
END $$;
