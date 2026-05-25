UPDATE lessons
SET body = replace(
  body,
  'Feeling very anxious or like something bad is going to happen.

:::did-you-know',
  'Feeling very anxious or like something bad is going to happen.

:::illustration[heart-attack-pain-map]

:::did-you-know'
)
WHERE slug = 'heart-attack-signs';