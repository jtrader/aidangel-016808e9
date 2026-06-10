
-- Remove duplicate, unconditionally-true SELECT policy on quiz_question_translations.
-- The remaining "Public read quiz question translations of published courses"
-- policy correctly restricts visibility to published courses only.
DROP POLICY IF EXISTS "Public read quiz translations" ON public.quiz_question_translations;

-- Hide cms_pages.preview_token from public/authenticated readers. Admins
-- (who use service_role or admin role) keep full column access via the
-- existing "Admins manage cms pages" policy. RLS still gates row visibility;
-- this strips a sensitive column from the public read path so listing
-- published pages no longer leaks preview tokens.
REVOKE SELECT (preview_token) ON public.cms_pages FROM anon, authenticated;
