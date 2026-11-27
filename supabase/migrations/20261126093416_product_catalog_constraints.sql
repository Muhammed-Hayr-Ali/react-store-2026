-- Destructively clear the mock catalog and its dependent cart/wishlist entries.
-- Categories and brands are retained.
DELETE FROM public.cart_items AS cart_items
USING public.products AS products
WHERE cart_items.product_id = products.id;

DELETE FROM public.wishlists AS wishlists
USING public.products AS products
WHERE wishlists.product_id = products.id;

DELETE FROM public.product_images;
DELETE FROM public.product_reviews;
DELETE FROM public.product_variants;
DELETE FROM public.products;

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS variant_id uuid;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_images'
      AND column_name = 'variant_sku'
  ) THEN
    EXECUTE $migration$
      UPDATE public.product_images AS images
      SET variant_id = variants.id
      FROM public.product_variants AS variants
      WHERE images.variant_id IS NULL
        AND variants.sku = images.variant_sku
    $migration$;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE category_id IS NULL OR brand_id IS NULL
  ) THEN
    RAISE EXCEPTION
      'Cannot require product category and brand: existing products contain NULL values.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.product_images
    WHERE is_primary
    GROUP BY product_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one primary image per product: duplicate primary images exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.product_reviews
    WHERE user_id IS NOT NULL
    GROUP BY product_id, user_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one review per user and product: duplicate reviews exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.product_images AS images
    LEFT JOIN public.product_variants AS variants
      ON variants.id = images.variant_id
    WHERE images.variant_id IS NOT NULL
      AND (
        variants.id IS NULL
        OR variants.product_id <> images.product_id
      )
  ) THEN
    RAISE EXCEPTION
      'Cannot migrate product image variant links: an image references a variant from another product or a missing variant.';
  END IF;
END;
$$;

ALTER TABLE public.products
  ALTER COLUMN category_id SET NOT NULL,
  ALTER COLUMN brand_id SET NOT NULL;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_brand_id_fkey,
  ADD CONSTRAINT products_brand_id_fkey
    FOREIGN KEY (brand_id)
    REFERENCES public.brands(id)
    ON DELETE RESTRICT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.product_variants'::regclass
      AND conname = 'product_variants_id_product_id_key'
      AND contype = 'u'
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT product_variants_id_product_id_key
      UNIQUE (id, product_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product_images'
      AND column_name = 'variant_sku'
  ) THEN
    ALTER TABLE public.product_images
      DROP CONSTRAINT IF EXISTS product_images_variant_sku_fkey,
      DROP COLUMN variant_sku;
  END IF;

  ALTER TABLE public.product_images
    DROP CONSTRAINT IF EXISTS product_images_variant_product_fkey;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.product_images'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute
         WHERE attrelid = 'public.product_images'::regclass
           AND attname = 'variant_id' AND NOT attisdropped),
        (SELECT attnum FROM pg_attribute
         WHERE attrelid = 'public.product_images'::regclass
           AND attname = 'product_id' AND NOT attisdropped)
      ]::smallint[]
      AND confrelid = 'public.product_variants'::regclass
      AND confkey = ARRAY[
        (SELECT attnum FROM pg_attribute
         WHERE attrelid = 'public.product_variants'::regclass
           AND attname = 'id' AND NOT attisdropped),
        (SELECT attnum FROM pg_attribute
         WHERE attrelid = 'public.product_variants'::regclass
           AND attname = 'product_id' AND NOT attisdropped)
      ]::smallint[]
      AND confdeltype = 'c'
      AND convalidated
  ) THEN
    ALTER TABLE public.product_images
      ADD CONSTRAINT product_images_variant_product_fkey
      FOREIGN KEY (variant_id, product_id)
      REFERENCES public.product_variants(id, product_id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_per_product_idx
  ON public.product_images (product_id)
  WHERE is_primary;

CREATE INDEX IF NOT EXISTS products_category_id_idx
  ON public.products (category_id);

CREATE INDEX IF NOT EXISTS products_brand_id_idx
  ON public.products (brand_id);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON public.product_variants (product_id);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON public.product_images (product_id);

CREATE INDEX IF NOT EXISTS product_images_variant_id_product_id_idx
  ON public.product_images (variant_id, product_id);

CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx
  ON public.product_reviews (product_id);

CREATE INDEX IF NOT EXISTS product_reviews_user_id_idx
  ON public.product_reviews (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_product_user_unique_idx
  ON public.product_reviews (product_id, user_id)
  WHERE user_id IS NOT NULL;