## Goal

For the 13 curated images previously skipped (no handle/SKU match), attach them to Shopify products whose **title/handle matches the image name minus the country prefix**. Duplicates are allowed — one image may be attached to multiple products across countries.

## Matching logic

For each image file `{country}-{rest}.{ext}` (e.g. `de-stjohn-home-kit.jpg`):
1. Strip the country prefix (`au-`, `uk-`, `us-`, `ca-`, `ie-`, `de-`, `fr-`, `nl-`, `se-`, `ae-`, `be-`) → base name `stjohn-home-kit`.
2. Search Shopify for products where `handle` contains the base name, OR `title` matches the base name (humanised: `St John Home Kit`).
3. Attach the image to **every matched product**, regardless of country — duplicates are intentional.

## Attach mode

- Add as a new image (append), so existing primary images from the earlier run are preserved.
- Note: `shopify--update_product` with `images` **replaces all** images. To append, we must re-send the existing image URLs plus the new local file. The script will:
  1. Fetch the current product (to get existing image URLs).
  2. Call `update_product` with `images: [...existing as {file_path: url}, {file_path: new_local, alt: title}]`.

## Steps

1. Re-stage the 13 unmatched images from `.tmp-shopify-images/`.
2. For each, compute base name and search Shopify (`handle:*{base}*` then title fallback).
3. For each matched product, fetch current images, then call `update_product` appending the new image.
4. Write `/mnt/documents/product-image-injection-report-v2.txt` listing per-image: matched products + attach status.

## Confirmations

- OK to attach the same image to multiple products (e.g. `stjohn-home-kit.jpg` → AU, UK, US, CA, DE, FR... home kit products)?
- OK to **append** (preserve existing primaries from run 1), not replace?
- If a base name still has zero matches across the store, skip and log.

## Deliverables

- Up to 13 × N image attachments across matching products.
- `product-image-injection-report-v2.txt` artifact.
