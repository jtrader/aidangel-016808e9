-- Inserts 8 Love Key Guardian colour variants into route_catalogue.
-- destination_url uses per-colour deep links on lovekey.com.au.
-- Price reflects the referral display price; sold externally via lovekey.com.au.

INSERT INTO public.route_catalogue (
  id, route_slug, title, description, vendor, image_url,
  route_type, cta_label, confidence, country,
  destination_url, partner_entity, utm_campaign, utm_content,
  availability_status, price, currency, synced_at
) VALUES
  (
    'gid://shopify/Product/9532178465023',
    'love-key-guardian-pink',
    'Love Key Guardian - Pink',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/pink-CgNLQ3cn.png?v=1781137647',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=pink#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-pink',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532178563327',
    'love-key-guardian-red',
    'Love Key Guardian - Red',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/red-CcOv5Ndk.png?v=1781137663',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=red#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-red',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532178694399',
    'love-key-guardian-green',
    'Love Key Guardian - Green',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/green-DW-hTDRI.png?v=1781137674',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=green#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-green',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532178792703',
    'love-key-guardian-light-blue',
    'Love Key Guardian - Light Blue',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/light-blue-BPsMIC5u.png?v=1781137684',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=light-blue#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-light-blue',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532178858239',
    'love-key-guardian-orange',
    'Love Key Guardian - Orange',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/orange-CH0pAYci.png?v=1781137695',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=orange#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-orange',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532179022079',
    'love-key-guardian-aqua',
    'Love Key Guardian - Aqua',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/aqua-BuMPYs_I.png?v=1781137707',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=aqua#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-aqua',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532179120383',
    'love-key-guardian-white',
    'Love Key Guardian - White',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/white-NO6un04K.png?v=1781137719',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=white#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-white',
    'available', 5.00, 'AUD', NOW()
  ),
  (
    'gid://shopify/Product/9532179218687',
    'love-key-guardian-yellow',
    'Love Key Guardian - Yellow',
    'Crafted with a polished metal frame for strength, beauty, and permanence. The Love Key Guardian is a premium reminder that care is always close. NFC enabled and QR Coded for convenience.',
    'Love Key',
    'https://cdn.shopify.com/s/files/1/0823/1786/9311/files/yellow-CsF9hmC3.png?v=1781137730',
    'product', 'Buy from Love Key', 'high', 'AU',
    'https://lovekey.com.au/?variant=metal&color=yellow#product-section',
    'Love Key', 'lovekey-referral', 'love-key-guardian-yellow',
    'available', 5.00, 'AUD', NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  destination_url      = EXCLUDED.destination_url,
  price                = EXCLUDED.price,
  currency             = EXCLUDED.currency,
  utm_campaign         = EXCLUDED.utm_campaign,
  utm_content          = EXCLUDED.utm_content,
  availability_status  = EXCLUDED.availability_status,
  synced_at            = EXCLUDED.synced_at;
