UPDATE public.courses
SET cover_url = regexp_replace(cover_url, '\?.*$', '') || '?v=3'
WHERE slug = 'severe-bleeding';