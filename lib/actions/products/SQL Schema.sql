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

  CONSTRAINT product_images_variant_product_fkey
    FOREIGN KEY (variant_id, product_id)
    REFERENCES product_variants(id, product_id)
    ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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


-- ============================================================================
-- 2. تطبيق سياسات الأمان (RLS Policies) باستخدام الدالة المخصصة
-- (true للقراءة العامة، false لمنع الكتابة العامة)
-- ============================================================================

SELECT public.apply_table_rls('products', 'product', true, false);
SELECT public.apply_table_rls('product_variants', 'product_variant', true, false);
SELECT public.apply_table_rls('product_images', 'product_image', true, false);
