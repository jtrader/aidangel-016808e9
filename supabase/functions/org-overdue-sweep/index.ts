// Cron-triggered: flips past-due 'assigned'/'in_progress' rows to 'overdue'
// and writes an audit entry per affected org.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Require auth — cron should call with the service-role key; admins may
  // also trigger manually. Anonymous callers are rejected.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const token = authHeader.replace("Bearer ", "");
  let authorized = token === SERVICE_KEY;
  if (!authorized) {
    const verifyClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: claimsData } = await verifyClient.auth.getClaims(token);
    const uid = claimsData?.claims?.sub;
    if (uid) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: roleRow } = await admin
        .from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      authorized = !!roleRow;
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const nowIso = new Date().toISOString();

  // Find candidates
  const { data: due, error: dueErr } = await supabase
    .from("org_course_assignments")
    .select("id, org_id, course_id, member_id")
    .in("status", ["assigned", "in_progress"])
    .not("due_at", "is", null)
    .lt("due_at", nowIso);

  if (dueErr) {
    console.error("overdue-sweep: query failed", dueErr);
    return new Response(JSON.stringify({ error: dueErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ ok: true, swept: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const ids = due.map((d) => d.id);
  const { error: updErr } = await supabase
    .from("org_course_assignments")
    .update({ status: "overdue" })
    .in("id", ids);

  if (updErr) {
    console.error("overdue-sweep: update failed", updErr);
    return new Response(JSON.stringify({ error: updErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Group by org for audit
  const byOrg = new Map<string, number>();
  for (const d of due) byOrg.set(d.org_id, (byOrg.get(d.org_id) ?? 0) + 1);

  const auditRows = Array.from(byOrg.entries()).map(([org_id, count]) => ({
    org_id,
    actor_id: null,
    action: "assignments.overdue_sweep",
    target_type: "system",
    target_id: null,
    metadata: { count, swept_at: nowIso },
  }));
  if (auditRows.length) await supabase.from("org_audit_log").insert(auditRows);

  return new Response(JSON.stringify({ ok: true, swept: ids.length, orgs: byOrg.size }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
