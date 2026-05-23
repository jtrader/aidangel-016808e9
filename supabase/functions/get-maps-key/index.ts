// Returns the correct Google Maps browser key based on the request origin.
// Managed Lovable key works only on *.lovable.app — custom domains need the user's own key.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const managed = Deno.env.get("GOOGLE_MAPS_BROWSER_KEY") ?? "";
  const custom = Deno.env.get("GOOGLE_MAPS_BROWSER_KEY_1") ?? "";
  const tracking = Deno.env.get("GOOGLE_MAPS_TRACKING_ID") ?? "";

  const origin = req.headers.get("origin") ?? "";
  let host = "";
  try { host = new URL(origin).hostname; } catch { /* ignore */ }

  const isLovablePreview =
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  const key = isLovablePreview ? (managed || custom) : (custom || managed);

  return new Response(
    JSON.stringify({ key, trackingId: tracking, source: isLovablePreview ? "managed" : "custom" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } },
  );
});
