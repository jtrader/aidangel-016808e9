UPDATE public.lessons
SET body = REPLACE(
  body,
  ':::

:::warning[Important ''Don''ts]',
  ':::

:::illustration[seizure-protect-head]

:::warning[Important ''Don''ts]'
)
WHERE slug = 'seizure-first-aid';