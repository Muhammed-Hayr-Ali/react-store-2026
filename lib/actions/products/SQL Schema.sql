-- ============================================================================
-- 1. بناء هيكل الجداول (Tables Creation)
-- ============================================================================

-- جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  meta_title VARCHAR(70),
  meta_description TEXT,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الخيارات / المتغيرات (Product Variants)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT product_variants_id_product_id_key UNIQUE (id, product_id),
  
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  attributes JSONB DEFAULT '{}'::jsonb, 
  
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  low_stock_threshold INTEGER NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  expiration_date DATE NULL,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- التأكد أن سعر الشطب دائماً أعلى من السعر الفعلي
  CONSTRAINT check_compare_price CHECK (
    compare_at_price IS NULL OR compare_at_price > price
  )
);

-- Add the nullable date column to existing installations as well.
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS expiration_date DATE NULL;

-- جدول الصور (Product Images)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  
  -- ربط الصورة بمتغير محدد (اختياري) مع ضمان تبعيته للمنتج نفسه
  variant_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT product_images_variant_product_fkey
    FOREIGN KEY (variant_id, product_id)
    REFERENCES product_variants(id, product_id)
    ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH legacy_products AS (
  SELECT product_id
  FROM product_images
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
  FROM product_images AS images
  JOIN legacy_products USING (product_id)
)
UPDATE product_images AS images
SET sort_order = ranked_images.sort_order
FROM ranked_images
WHERE images.id = ranked_images.id;

CREATE INDEX IF NOT EXISTS products_category_id_idx
  ON products (category_id);

CREATE INDEX IF NOT EXISTS products_brand_id_idx
  ON products (brand_id);

CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_per_product_idx
  ON product_images (product_id)
  WHERE is_primary;

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON product_variants (product_id);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON product_images (product_id);

CREATE INDEX IF NOT EXISTS product_images_variant_id_product_id_idx
  ON product_images (variant_id, product_id);

CREATE INDEX IF NOT EXISTS product_images_product_order_idx
  ON product_images (product_id, sort_order, id);

DO $$
DECLARE
  conflicting_skus text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM product_variants
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
    FROM product_variants
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

UPDATE product_variants
SET sku = upper(btrim(sku))
WHERE sku IS DISTINCT FROM upper(btrim(sku));

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_case_insensitive_idx
  ON product_variants (upper(btrim(sku)));


-- ============================================================================
-- 2. تطبيق سياسات الأمان (RLS Policies) باستخدام الدالة المخصصة
-- (true للقراءة العامة، false لمنع الكتابة العامة)
-- ============================================================================

SELECT public.apply_table_rls('products', 'product', true, false);
SELECT public.apply_table_rls('product_variants', 'product_variant', true, false);
SELECT public.apply_table_rls('product_images', 'product_image', true, false);
