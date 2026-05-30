
-- Blog categories (one per program landing page)
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  program_slug text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog categories" ON public.blog_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins manage blog categories" ON public.blog_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER blog_categories_updated_at BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  cover_image_url text,
  cover_alt text,
  author text,
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_minutes int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_category_idx ON public.blog_posts(category_id, published_at DESC);
CREATE INDEX blog_posts_published_idx ON public.blog_posts(is_published, published_at DESC);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Rich content blocks for posts
CREATE TABLE public.blog_post_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  -- block_type: richtext | heading | image | video | audio | infographic | embed | callout | quote | cta | faq | divider
  block_type text NOT NULL DEFAULT 'richtext',
  title text,
  body_md text,
  media_url text,        -- video/audio/image/infographic src
  media_poster_url text, -- video poster
  media_alt text,        -- image/infographic alt
  caption text,          -- caption beneath media
  embed_html text,       -- raw embed (admin-only, sanitized at render)
  cta_label text,
  cta_url text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_post_blocks_post_idx ON public.blog_post_blocks(post_id, sort_order);

GRANT SELECT ON public.blog_post_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_post_blocks TO authenticated;
GRANT ALL ON public.blog_post_blocks TO service_role;

ALTER TABLE public.blog_post_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blocks of published posts" ON public.blog_post_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.blog_posts p
            WHERE p.id = post_id
              AND (p.is_published = true OR has_role(auth.uid(), 'admin'::app_role)))
  );
CREATE POLICY "Admins manage post blocks" ON public.blog_post_blocks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER blog_post_blocks_updated_at BEFORE UPDATE ON public.blog_post_blocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Storage bucket for blog media
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media', 'blog-media', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read blog media" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Admins upload blog media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update blog media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete blog media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-media' AND has_role(auth.uid(), 'admin'::app_role));
