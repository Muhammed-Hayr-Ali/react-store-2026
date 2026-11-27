DO $$
DECLARE
  conflicting_skus text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.product_variants
    WHERE btrim(sku) = ''
  ) THEN
    RAISE EXCEPTION
      'Cannot normalize product variant SKUs: at least one SKU is empty after trimming.';
  END IF;

  SELECT string_agg(
    format('%s (%s rows)', normalized_sku, duplicate_count),
    ', '
    ORDER BY normalized_sku
  )
  INTO conflicting_skus
  FROM (
    SELECT upper(btrim(sku)) AS normalized_sku, count(*) AS duplicate_count
    FROM public.product_variants
    GROUP BY upper(btrim(sku))
    HAVING count(*) > 1
  ) AS duplicates;

  IF conflicting_skus IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot normalize product variant SKUs: case-insensitive duplicates exist: %',
      conflicting_skus;
  END IF;
END;
$$;

UPDATE public.product_variants
SET sku = upper(btrim(sku))
WHERE sku IS DISTINCT FROM upper(btrim(sku));

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_case_insensitive_idx
  ON public.product_variants (upper(btrim(sku)));

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

WITH legacy_products AS (
  SELECT product_id
  FROM public.product_images
  GROUP BY product_id
  HAVING count(*) > 1
    AND min(sort_order) = 0
    AND max(sort_order) = 0
),
ranked_images AS (
  SELECT
    images.id,
    row_number() OVER (
      PARTITION BY images.product_id
      ORDER BY images.created_at ASC, images.id ASC
    ) - 1 AS sort_order
  FROM public.product_images AS images
  JOIN legacy_products USING (product_id)
)
UPDATE public.product_images AS images
SET sort_order = ranked_images.sort_order
FROM ranked_images
WHERE images.id = ranked_images.id;

CREATE INDEX IF NOT EXISTS product_images_product_order_idx
  ON public.product_images (product_id, sort_order, id);