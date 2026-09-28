-- ============================================================================
-- جدول متغيرات المنتجات (Product Variants) - Marketna
-- يحتوي على التفاصيل الخاصة بكل متغير (السعر، المخزون، السمات)
-- ============================================================================

CREATE TABLE public.product_variants (
  -- المعرف الفريد
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- العلاقة بالمنتج (حذف المتغيرات عند حذف المنتج)
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- رمز المنتج (SKU) - فريد على مستوى المتجر
  sku TEXT UNIQUE NOT NULL,
  
  -- اسم المتغير (مثل: "أحمر - كبير" أو "500ml")
  name TEXT,
  
  -- السمات الديناميكية (JSONB) - مرنة وقابلة للبحث
  -- مثال: {"color": "red", "size": "large", "weight": "500g"}
  attributes JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- التسعير (NUMERIC لتجنب أخطاء الفاصلة العائمة)
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  
  -- إدارة المخزون
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  track_inventory BOOLEAN DEFAULT true NOT NULL,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  
  -- حالة الترتيب والعرض
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- الطوابع الزمنية
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.product_variants IS 'متغيرات المنتجات (الأحجام، الألوان، النكهات) مع الأسعار والمخزون';
COMMENT ON COLUMN public.product_variants.sku IS 'رمز المنتج الفريد (Stock Keeping Unit)';
COMMENT ON COLUMN public.product_variants.attributes IS 'السمات الديناميكية بصيغة JSONB (مثل اللون، الحجم، الوزن)';
COMMENT ON COLUMN public.product_variants.compare_at_price IS 'السعر قبل الخصم (لإظهار الخصم للعميل)';

-- ============================================================================
-- القيود (Constraints) لضمان سلامة البيانات
-- ============================================================================

-- التأكد من أن SKU ليس فارغاً
ALTER TABLE public.product_variants 
ADD CONSTRAINT check_variant_sku_not_empty 
CHECK (length(trim(sku)) > 0);

-- التأكد من أن compare_at_price أكبر من price (إذا وُجد)
ALTER TABLE public.product_variants 
ADD CONSTRAINT check_compare_at_price_greater 
CHECK (compare_at_price IS NULL OR compare_at_price > price);

-- ============================================================================
-- الفهارس (Indexes) لتحسين الأداء
-- ============================================================================

-- فهرس فريد على SKU (موجود تلقائياً بسبب UNIQUE، لكن نؤكده)
CREATE UNIQUE INDEX idx_variants_sku ON public.product_variants(sku);

-- فهرس على product_id للاستعلامات السريعة
CREATE INDEX idx_variants_product_id ON public.product_variants(product_id);

-- فهرس مركب للمنتجات النشطة (شائع جداً في الواجهة الأمامية)
CREATE INDEX idx_variants_product_active ON public.product_variants(product_id, is_active) 
WHERE is_active = true;

-- ✅ فهرس GIN على attributes للبحث داخل السمات (JSONB)
-- يسمح باستعلامات مثل: WHERE attributes @> '{"color": "red"}'
CREATE INDEX idx_variants_attributes ON public.product_variants USING GIN (attributes);

-- فهرس للمخزون المنخفض (للتقارير والتنبيهات)
CREATE INDEX idx_variants_low_stock ON public.product_variants(stock_quantity, low_stock_threshold)
WHERE track_inventory = true AND stock_quantity <= low_stock_threshold;

-- ============================================================================
-- دالة تحديث updated_at تلقائياً
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_product_variants ON public.product_variants;
CREATE TRIGGER set_updated_at_product_variants 
  BEFORE UPDATE ON public.product_variants 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- تفعيل RLS وسياسات الأمان
-- ============================================================================

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Public read active variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin read all variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin manage variants" ON public.product_variants;

-- 1. الزوار يرون متغيرات المنتجات النشطة فقط
CREATE POLICY "Public read active variants" ON public.product_variants
FOR SELECT
TO public
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_variants.product_id 
    AND products.is_active = true
  )
);

-- 2. المدير يرى جميع المتغيرات
CREATE POLICY "Admin read all variants" ON public.product_variants
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. المدير يدير جميع المتغيرات
CREATE POLICY "Admin manage variants" ON public.product_variants
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());