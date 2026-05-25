UPDATE public.lessons
SET body = replace(
  body,
  'Burns are given names based on how deep they go into the skin.',
  E'Burns are given names based on how deep they go into the skin.\n\n:::illustration[burn-depth-layers]'
)
WHERE id = 'da648a11-1f33-463c-aa4f-235189daf6cb'
  AND body NOT LIKE '%burn-depth-layers%';