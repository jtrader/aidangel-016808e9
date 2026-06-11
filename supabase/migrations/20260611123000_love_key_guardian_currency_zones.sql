-- Expands Love Key Guardian referral rows across currency zones.
-- The original AU/AUD rows stay as the default; this adds GB/GBP, US/USD,
-- CA/CAD and NZ/NZD rows for each of the 8 colours (32 rows total),
-- all priced at 5.00 in the local currency.

WITH colours(colour_slug, colour_title, shopify_gid, image_url) AS (
  VALUES
    ('pink',       'Pink',       'gid://shopify/Product/9532178465023', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/pink-CgNLQ3cn.png?v=1781137647'),
    ('red',        'Red',        'gid://shopify/Product/9532178563327', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/red-CcOv5Ndk.png?v=1781137663'),
    ('green',      'Green',      'gid://shopify/Product/9532178694399', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/green-DW-hTDRI.png?v=1781137674'),
    ('light-blue', 'Light Blue', 'gid://shopify/Product/9532178792703', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/light-blue-BPsMIC5u.png?v=1781137684'),
    ('orange',     'Orange',     'gid://shopify/Product/9532178858239', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/orange-CH0pAYci.png?v=1781137695'),
    ('aqua',       'Aqua',       'gid://shopify/Product/9532179022079', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/aqua-BuMPYs_I.png?v=1781137707'),
    ('white',      'White',      'gid://shopify/Product/9532179120383', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/white-NO6un04K.png?v=1781137719'),
    ('yellow',     'Yellow',     'gid://shopify/Product/9532179218687', 'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/yellow-CsF9hmC3.png?v=1781137730')
),
zones(country, currency) AS (
  VALUES ('GB', 'GBP'), ('US', 'USD'), ('CA', 'CAD'), ('NZ', 'NZD')
)
INSERT INTO public.route_catalogue (
  id, route_slug, title, description, vendor, image_url,
  route_type, cta_label, confidence, country,
  destination_url, partner_entity, utm_campaign, utm_content,
  availability_status, price, currency, synced_at
)
SELECT
  c.shopify_gid || '-' || lower(z.country),
  'love-key-guardian-' || c.colour_slug || '-' || lower(z.country),
  'Love Key Guardian - ' || c.colour_title,
  'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
  'Love Key',
  c.image_url,
  'product', 'Buy from Love Key', 'high', z.country,
  'https://lovekey.com.au/?variant=metal&color=' || c.colour_slug || '#product-section',
  'Love Key', 'lovekey-referral',
  'love-key-guardian-' || c.colour_slug || '-' || lower(z.country),
  'available', 5.00, z.currency, NOW()
FROM colours c
CROSS JOIN zones z
ON CONFLICT (id) DO UPDATE SET
  destination_url     = EXCLUDED.destination_url,
  price               = EXCLUDED.price,
  currency            = EXCLUDED.currency,
  country             = EXCLUDED.country,
  availability_status = EXCLUDED.availability_status,
  synced_at           = EXCLUDED.synced_at;
