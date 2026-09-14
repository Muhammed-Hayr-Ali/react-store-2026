-- ============================================================================
-- جدول العلامات التجارية (Brands) - Marketna
-- الاسم الإنجليزي أساسي، العربي اختياري، مع الشعار للفرز والعرض
-- ============================================================================

CREATE TABLE public.brands (
  -- المعرف الفريد
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- الأسماء (الإنجليزي أساسي)
  name TEXT NOT NULL,                    -- الاسم الإنجليزي (أساسي)
  name_ar TEXT,                          -- الاسم العربي (اختياري)
  
  -- الرابط الصديق لمحركات البحث
  slug TEXT UNIQUE NOT NULL,             -- يُشتق من name الإنجليزي
  
  -- وسائط العلامة التجارية
  logo_url TEXT,                         -- رابط صورة الشعار
  logo_alt TEXT,                         -- نص بديل للشعار (للوصولية و SEO)
  
  -- الطوابع الزمنية
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.brands IS 'العلامات التجارية للمنتجات - للفرز وعرض الشعار';

-- ============================================================================
-- القيود (Constraints)
-- ============================================================================

-- التأكد من أن الاسم الإنجليزي ليس فارغاً أو مسافات فقط
ALTER TABLE public.brands 
ADD CONSTRAINT check_brand_name_not_empty 
CHECK (length(trim(name)) > 0);

-- التأكد من أن الـ slug ليس فارغاً
ALTER TABLE public.brands 
ADD CONSTRAINT check_brand_slug_not_empty 
CHECK (length(trim(slug)) > 0);

-- ============================================================================
-- الفهارس (Indexes) لتحسين الأداء
-- ============================================================================

-- فهرس على slug للبحث السريع عبر الروابط
CREATE INDEX idx_brands_slug ON public.brands(slug);

-- فهرس على name للبحث والفرز الأبجدي
CREATE INDEX idx_brands_name ON public.brands(name);

-- ============================================================================
-- دالة تحديث updated_at تلقائياً
-- ============================================================================
-- (ملاحظة: نفترض أن دالة handle_updated_at() موجودة مسبقاً من جدول categories)

DROP TRIGGER IF EXISTS set_updated_at_brands ON public.brands;
CREATE TRIGGER set_updated_at_brands 
  BEFORE UPDATE ON public.brands 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- تفعيل RLS وسياسات الأمان
-- ============================================================================

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- حذف أي سياسات قديمة لتجنب التعارض
DROP POLICY IF EXISTS "Public read access to brands" ON public.brands;
DROP POLICY IF EXISTS "Admin manage brands" ON public.brands;

-- 1. سياسة القراءة: الجميع يمكنه رؤية العلامات التجارية (ضروري للفلترة وعرض المنتجات للزوار)
CREATE POLICY "Public read access to brands" ON public.brands
FOR SELECT
TO public
USING (true);

-- 2. سياسة الإدارة: فقط المدير (Admin) يمكنه الإضافة، التعديل، والحذف
-- (تعتمد على دالة public.is_admin() الموجودة مسبقاً في مشروعك)
CREATE POLICY "Admin manage brands" ON public.brands
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- بيانات تجريبية للعلامات التجارية (Brands) - Marketna
-- ============================================================================

INSERT INTO public.brands (name, name_ar, slug, logo_url, logo_alt) VALUES
  ('Pepsi', 'بيبسي', 'pepsi', 'https://example.com/logos/pepsi.png', 'شعار بيبسي'),
  ('Nadec', 'نادك', 'nadec', 'https://example.com/logos/nadec.png', 'شعار نادك'),
  ('Almarai', 'المراعي', 'almarai', 'https://example.com/logos/almarai.png', 'شعار المراعي'),
  ('Nestle', 'نستله', 'nestle', 'https://example.com/logos/nestle.png', 'شعار نستله'),
  ('Lays', 'ليز', 'lays', 'https://example.com/logos/lays.png', 'شعار ليز'),
  ('Cadbury', 'كادبوري', 'cadbury', 'https://example.com/logos/cadbury.png', 'شعار كادبوري'),
  ('Arla', 'أرلا', 'arla', 'https://example.com/logos/arla.png', 'شعار أرلا'),
  ('Heinz', 'هاينز', 'heinz', 'https://example.com/logos/heinz.png', 'شعار هاينز'),
  ('No Brand', 'بدون علامة', 'no-brand', 'https://example.com/logos/no-brand.png', 'منتجات بدون علامة تجارية');