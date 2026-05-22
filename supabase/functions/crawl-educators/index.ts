// Discover first aid educators via Firecrawl + Lovable AI; queue into pending_educators.
// Admin only.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FC = "https://api.firecrawl.dev/v2";
const AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface CrawlBody {
  country_code: string;
  country_name?: string;
  language_code?: string;
  language_name?: string;
  max_results?: number;
}

interface Discovered {
  name: string;
  type: "st_john" | "red_cross" | "other_ngo" | "commercial" | "online" | "community";
  blurb?: string;
  website?: string;
  booking_url?: string;
  is_online?: boolean;
  city?: string;
  region?: string;
  address?: string;
  phone?: string;
  languages?: string[];
  source_url?: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Authn + admin check
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as CrawlBody;
    if (!body.country_code) {
      return new Response(JSON.stringify({ error: "country_code required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const country = body.country_code.toUpperCase();
    const countryName = body.country_name ?? country;
    const lang = body.language_code ?? "en";
    const langName = body.language_name ?? lang;
    const maxResults = Math.min(body.max_results ?? 8, 15);

    // 1. Firecrawl search for providers
    const queries = [
      `St John Ambulance first aid courses ${countryName}`,
      `Red Cross first aid training ${countryName}`,
      `first aid course ${countryName} ${langName}`,
    ];
    const searchPages: Array<{ url: string; title?: string; markdown?: string; description?: string }> = [];
    for (const query of queries) {
      const r = await fetch(`${FC}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit: 5, scrapeOptions: { formats: ["markdown"] } }),
      });
      if (!r.ok) {
        console.error("Firecrawl search failed", r.status, await r.text());
        continue;
      }
      const data = await r.json();
      const results = data?.data?.web ?? data?.data ?? [];
      for (const it of results) {
        searchPages.push({
          url: it.url,
          title: it.title,
          markdown: it.markdown,
          description: it.description,
        });
      }
    }

    // 2. Ask Lovable AI to extract structured providers
    const context = searchPages.slice(0, 20).map((p, i) =>
      `[${i}] ${p.title ?? ""}\nURL: ${p.url}\n${(p.markdown ?? p.description ?? "").slice(0, 1500)}`
    ).join("\n\n---\n\n");

    const aiRes = await fetch(AI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You extract accredited first aid training providers from web search results. Prefer St John Ambulance and Red Cross national chapters. Include other reputable NGOs and commercial providers operating in the named country. Return JSON only via the tool." },
          { role: "user", content: `Country: ${countryName} (${country})\nLanguage: ${langName} (${lang})\n\nWeb search results:\n${context}\n\nExtract up to ${maxResults} distinct providers.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "list_providers",
            description: "List discovered first aid training providers.",
            parameters: {
              type: "object",
              properties: {
                providers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string", enum: ["st_john", "red_cross", "other_ngo", "commercial", "online", "community"] },
                      blurb: { type: "string" },
                      website: { type: "string" },
                      booking_url: { type: "string" },
                      is_online: { type: "boolean" },
                      city: { type: "string" },
                      region: { type: "string" },
                      address: { type: "string" },
                      phone: { type: "string" },
                      languages: { type: "array", items: { type: "string" } },
                      source_url: { type: "string" },
                    },
                    required: ["name", "type"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["providers"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "list_providers" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit — try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Add credits in Lovable workspace to keep crawling." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway ${aiRes.status}: ${t}`);
    }
    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no tool call");
    const parsed = JSON.parse(toolCall.function.arguments) as { providers: Discovered[] };

    // 3. Insert into pending_educators
    const rows = parsed.providers.slice(0, maxResults).map((p) => ({
      name: p.name,
      slug: slugify(`${p.name}-${country.toLowerCase()}`),
      type: p.type,
      blurb: p.blurb ?? null,
      website: p.website ?? null,
      booking_url: p.booking_url ?? null,
      hq_country_code: country,
      is_online: !!p.is_online,
      country_code: country,
      region: p.region ?? null,
      city: p.city ?? null,
      address: p.address ?? null,
      phone: p.phone ?? null,
      languages: p.languages?.length ? p.languages : [lang],
      source: "crawler",
      source_url: p.source_url ?? null,
      status: "pending" as const,
    }));

    const { data: inserted, error: insErr } = await admin
      .from("pending_educators")
      .insert(rows)
      .select("id, name");
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ discovered: inserted?.length ?? 0, items: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crawl-educators error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
