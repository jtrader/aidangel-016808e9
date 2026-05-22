CREATE OR REPLACE FUNCTION public.get_claim_statuses(claim_ids uuid[])
RETURNS TABLE(id uuid, status text, created_at timestamptz, review_notes text, reviewed_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, status::text, created_at, review_notes, reviewed_at
  FROM public.educator_claims
  WHERE id = ANY(claim_ids);
$$;