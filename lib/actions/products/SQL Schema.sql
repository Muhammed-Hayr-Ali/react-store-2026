-- ============================================================================
-- 1. بناء هيكل الجداول (Tables Creation)
-- ============================================================================

-- جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
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
  
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  attributes JSONB DEFAULT '{}'::jsonb, 
  
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  low_stock_threshold INTEGER NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- التأكد أن سعر الشطب دائماً أعلى من السعر الفعلي
  CONSTRAINT check_compare_price CHECK (
    compare_at_price IS NULL OR compare_at_price > price
  )
);

-- جدول الصور (Product Images)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  
  -- ربط الصورة بمتغير محدد (اختياري)
  variant_sku VARCHAR(100) REFERENCES product_variants(sku) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. تطبيق سياسات الأمان (RLS Policies) باستخدام الدالة المخصصة
-- (true للقراءة العامة، false لمنع الكتابة العامة)
-- ============================================================================

SELECT public.apply_table_rls('products', 'product', true, false);
SELECT public.apply_table_rls('product_variants', 'product_variant', true, false);
SELECT public.apply_table_rls('product_images', 'product_image', true, false);