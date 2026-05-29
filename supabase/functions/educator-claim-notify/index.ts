// Server-side wrapper for educator-claim transactional emails.
// Replaces direct client calls to send-transactional-email so the caller
// cannot choose arbitrary templates or recipients — both are derived from
// the claim row in the database.
//
// Actions:
//   - "submitted": anonymous-friendly; sends "claim-received" to the
//     claimant_email stored on the claim. Idempotent per claim id.
//   - "approved" / "rejected": admin-only; sends the matching template to
//     the claimant_email stored on the claim.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

type Action = 'submitted' | 'approved' | 'rejected'

interface Body {
  action: Action
  claim_id: string
  origin?: string
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  let payload: Body
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const { action, claim_id, origin } = payload ?? {}
  if (!claim_id || typeof claim_id !== 'string') return json(400, { error: 'claim_id required' })
  if (!['submitted', 'approved', 'rejected'].includes(action)) {
    return json(400, { error: 'invalid action' })
  }

  const authHeader = req.headers.get('Authorization') ?? ''

  // For admin-only actions, require an authenticated admin caller.
  if (action === 'approved' || action === 'rejected') {
    if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' })
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''))
    const uid = claims?.claims?.sub
    if (!uid) return json(401, { error: 'Unauthorized' })
    const { data: isAdmin, error: roleErr } = await userClient.rpc('has_role', {
      _user_id: uid,
      _role: 'admin',
    })
    if (roleErr || !isAdmin) return json(403, { error: 'Forbidden' })
  }

  // Load the claim with service role so we always get the canonical email/data.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: claim, error: cErr } = await admin
    .from('educator_claims')
    .select('id, status, claimant_email, claimant_name, review_notes, educator:educators(name, slug)')
    .eq('id', claim_id)
    .maybeSingle()
  if (cErr || !claim) return json(404, { error: 'Claim not found' })

  const claimAny = claim as unknown as {
    id: string
    status: string
    claimant_email: string
    claimant_name: string
    review_notes: string | null
    educator: { name: string; slug: string } | null
  }

  // For decision actions, the claim's persisted status must match — prevents
  // sending an "approved" email for a still-pending or rejected claim.
  if (action === 'approved' && claimAny.status !== 'approved') {
    return json(409, { error: 'Claim is not approved' })
  }
  if (action === 'rejected' && claimAny.status !== 'rejected') {
    return json(409, { error: 'Claim is not rejected' })
  }

  const safeOrigin = typeof origin === 'string' && /^https?:\/\//.test(origin) ? origin : null
  const profileUrl =
    safeOrigin && claimAny.educator
      ? `${safeOrigin}/learn/provider/${claimAny.educator.slug}`
      : undefined

  let templateName: string
  let templateData: Record<string, unknown>
  if (action === 'submitted') {
    templateName = 'claim-received'
    templateData = {
      name: claimAny.claimant_name,
      educatorName: claimAny.educator?.name,
    }
  } else if (action === 'approved') {
    templateName = 'claim-approved'
    templateData = {
      name: claimAny.claimant_name,
      educatorName: claimAny.educator?.name,
      profileUrl,
      notes: claimAny.review_notes ?? undefined,
    }
  } else {
    templateName = 'claim-rejected'
    templateData = {
      name: claimAny.claimant_name,
      educatorName: claimAny.educator?.name,
      notes: claimAny.review_notes ?? undefined,
    }
  }

  // Invoke send-transactional-email with the service role so the strict JWT
  // check on that function accepts us.
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateName,
      recipientEmail: claimAny.claimant_email,
      idempotencyKey: `${templateName}-${claimAny.id}`,
      templateData,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    return json(502, { error: 'Email send failed', detail: text.slice(0, 500) })
  }

  return json(200, { ok: true })
})
