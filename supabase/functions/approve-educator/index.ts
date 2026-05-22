// Promote a pending_educators row into the live educators tables. Admin only.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { pending_id } = await req.json();
    if (!pending_id) {
      return new Response(JSON.stringify({ error: "pending_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: p, error: pErr } = await admin
      .from("pending_educators").select("*").eq("id", pending_id).maybeSingle();
    if (pErr) throw pErr;
    if (!p) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (p.status !== "pending") {
      return new Response(JSON.stringify({ error: `Already ${p.status}` }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ensure unique slug
    let slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data: existing } = await admin.from("educators").select("id").eq("slug", slug).maybeSingle();
    if (existing) slug = `${slug}-${p.id.slice(0, 6)}`;

    const { data: ed, error: edErr } = await admin.from("educators").insert({
      slug,
      name: p.name,
      type: p.type,
      blurb: p.blurb,
      website: p.website,
      booking_url: p.booking_url,
      logo_url: p.logo_url,
      hq_country_code: p.hq_country_code,
      is_online: p.is_online,
      is_verified: true,
      priority: 0,
    }).select("id").single();
    if (edErr) throw edErr;

    // Location (if any)
    if (p.country_code && (p.city || p.address || p.lat)) {
      await admin.from("educator_locations").insert({
        educator_id: ed.id,
        country_code: p.country_code,
        region: p.region,
        city: p.city,
        address: p.address,
        postcode: p.postcode,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        booking_url: p.booking_url,
      });
    }

    // Service area
    if (p.country_code && !p.is_online) {
      await admin.from("educator_service_areas").insert({
        educator_id: ed.id,
        country_code: p.country_code,
        region: p.region,
        city: p.city,
        notes: p.service_area_notes,
      });
    }

    // Languages
    if (p.languages?.length) {
      await admin.from("educator_languages").insert(
        p.languages.map((language_code: string) => ({ educator_id: ed.id, language_code })),
      );
    }

    await admin.from("pending_educators").update({
      status: "approved",
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", pending_id);

    return new Response(JSON.stringify({ educator_id: ed.id, slug }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("approve-educator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
