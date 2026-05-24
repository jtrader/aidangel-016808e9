
-- 1. Add video columns to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_duration_seconds numeric;

-- 2. Progress table
CREATE TABLE IF NOT EXISTS public.course_video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  seconds_watched numeric NOT NULL DEFAULT 0,
  last_position_seconds numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.course_video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own video progress"
  ON public.course_video_progress FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own video progress"
  ON public.course_video_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own video progress"
  ON public.course_video_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER course_video_progress_touch
  BEFORE UPDATE ON public.course_video_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read lesson videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-videos');

CREATE POLICY "Admins upload lesson videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lesson-videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update lesson videos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lesson-videos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete lesson videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lesson-videos' AND public.has_role(auth.uid(), 'admin'::app_role));
