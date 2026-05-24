
-- 1. org_invitations: replace anon "true" SELECT with SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Anon can read invitation by token" ON public.org_invitations;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS TABLE (
  org_id uuid,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.org_id, i.expires_at, i.accepted_at
  FROM public.org_invitations i
  WHERE i.token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.accept_invitation_by_token(_token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.org_invitations
  SET accepted_at = now()
  WHERE token = _token AND accepted_at IS NULL;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation_by_token(text) TO authenticated;

-- 2. org_members: split read policy so learners only see themselves
DROP POLICY IF EXISTS "Members read own org members" ON public.org_members;

CREATE POLICY "Members read own row"
ON public.org_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Managers read all org members"
ON public.org_members
FOR SELECT
TO authenticated
USING (
  public.has_org_role(auth.uid(), org_id, 'manager'::org_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. subscriptions: remove from realtime publication (sensitive billing data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'subscriptions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.subscriptions';
  END IF;
END $$;

-- 4. org_program_assignments: tighten role from public to authenticated
DROP POLICY IF EXISTS "Members read program assignments in their org" ON public.org_program_assignments;
DROP POLICY IF EXISTS "Managers manage program assignments" ON public.org_program_assignments;

CREATE POLICY "Members read program assignments in their org"
ON public.org_program_assignments
FOR SELECT
TO authenticated
USING (
  public.is_org_member(auth.uid(), org_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Managers manage program assignments"
ON public.org_program_assignments
FOR ALL
TO authenticated
USING (
  public.has_org_role(auth.uid(), org_id, 'manager'::org_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  public.has_org_role(auth.uid(), org_id, 'manager'::org_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 5. educator_claims: bind claim to authenticated user for IDOR protection
ALTER TABLE public.educator_claims
  ADD COLUMN IF NOT EXISTS submitter_user_id uuid;
