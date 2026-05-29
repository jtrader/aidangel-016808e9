import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export type CmsBlock = {
  id: string;
  block_key: string;
  block_type: string;
  sort_order: number;
  title: string | null;
  body_md: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  data: Record<string, unknown>;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  blocks: CmsBlock[];
};

export function useCmsPage(slug: string) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: p, error: pErr } = await supabase
        .from("cms_pages")
        .select("id, slug, title, description, is_published")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (pErr || !p) {
        setError(pErr?.message ?? "Page not found");
        setPage(null);
        setLoading(false);
        return;
      }
      const { data: blocks } = await supabase
        .from("cms_blocks")
        .select("id, block_key, block_type, sort_order, title, body_md, image_url, cta_label, cta_url, data")
        .eq("page_id", p.id)
        .order("sort_order", { ascending: true });

      let outPage = { ...p, blocks: (blocks as CmsBlock[]) ?? [] } as CmsPage;

      if (language && language !== "en") {
        const [{ data: pageTr }, { data: blockTrs }] = await Promise.all([
          supabase.from("cms_page_translations")
            .select("title, description").eq("page_id", p.id).eq("lang", language).maybeSingle(),
          supabase.from("cms_block_translations")
            .select("block_id, title, body_md, cta_label").eq("lang", language)
            .in("block_id", (blocks ?? []).map((b: any) => b.id)),
        ]);
        if (pageTr) {
          outPage.title = pageTr.title ?? outPage.title;
          outPage.description = pageTr.description ?? outPage.description;
        }
        if (blockTrs?.length) {
          const map = new Map(blockTrs.map((t: any) => [t.block_id, t]));
          outPage.blocks = outPage.blocks.map((b) => {
            const t = map.get(b.id);
            return t ? { ...b, title: t.title ?? b.title, body_md: t.body_md ?? b.body_md, cta_label: t.cta_label ?? b.cta_label } : b;
          });
        }
      }

      if (cancelled) return;
      setPage(outPage);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, language]);

  return { page, loading, error };
}
