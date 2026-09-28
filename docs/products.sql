-- ============================================================================
-- جدول المنتجات (Products) - Marketna
-- يتضمن المعلومات الأساسية، مع صورة رئيسية للأداء السريع في قوائم المنتجات
-- ============================================================================

CREATE TABLE public.products (
  -- المعرف الفريد
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- العلاقات (Foreign Keys)
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  
  -- المعلومات الأساسية
  name TEXT NOT NULL,
  
  -- الرابط الصديق لمحركات البحث
  slug TEXT UNIQUE NOT NULL,
  
  -- الوصف التفصيلي
  description TEXT,
  
  -- الوسائط (Denormalization للأداء السريع في صفحات القوائم)
  main_image_url TEXT,
  main_image_alt TEXT,
  
  -- SEO Meta (اختياري لكن مفيد للمتاجر)
  meta_title TEXT,
  meta_description TEXT,
  
  -- حالة المنتج
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  
  -- الطوابع الزمنية
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.products IS 'المنتجات الأساسية في المتجر، مرتبطة بالتصنيفات والعلامات التجارية';

-- ============================================================================
-- القيود (Constraints) لضمان سلامة البيانات
-- ============================================================================

-- التأكد من أن الاسم ليس فارغاً
ALTER TABLE public.products 
ADD CONSTRAINT check_product_name_not_empty 
CHECK (length(trim(name)) > 0);

-- التأكد من أن الـ slug ليس فارغاً
ALTER TABLE public.products 
ADD CONSTRAINT check_product_slug_not_empty 
CHECK (length(trim(slug)) > 0);

-- التأكد من أن meta_title ليس طويلاً جداً
ALTER TABLE public.products 
ADD CONSTRAINT check_product_meta_title_length 
CHECK (meta_title IS NULL OR length(meta_title) <= 70);

-- ============================================================================
-- الفهارس (Indexes) لتحسين أداء الاستعلامات والفلترة
-- ============================================================================

-- فهرس فريد على slug للبحث السريع
CREATE UNIQUE INDEX idx_products_slug ON public.products(slug);

-- فهارس للفلترة والفرز الشائع في واجهة المتجر
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;

-- فهرس مركب للاستعلامات الشائعة (المنتجات النشطة في تصنيف معين)
CREATE INDEX idx_products_category_active ON public.products(category_id, is_active) 
WHERE is_active = true;

-- فهرس مركب للمنتجات المميزة النشطة
CREATE INDEX idx_products_featured_active ON public.products(is_featured, is_active) 
WHERE is_featured = true AND is_active = true;

-- ============================================================================
-- دالة تحديث updated_at تلقائياً
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- تفعيل RLS وسياسات الأمان (Row Level Security)
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات قديمة لتجنب التعارض
DROP POLICY IF EXISTS "Public read access to active products" ON public.products;
DROP POLICY IF EXISTS "Admin read all products" ON public.products;
DROP POLICY IF EXISTS "Admin manage all products" ON public.products;

-- 1. سياسة القراءة العامة: الزوار يرون المنتجات النشطة فقط
CREATE POLICY "Public read access to active products" ON public.products
FOR SELECT
TO public
USING (is_active = true);

-- 2. سياسة قراءة المدير: يرى جميع المنتجات (النشطة وغير النشطة)
CREATE POLICY "Admin read all products" ON public.products
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. سياسة الإدارة: فقط المدير يمكنه الإضافة، التعديل، والحذف
CREATE POLICY "Admin manage all products" ON public.products
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());