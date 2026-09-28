-- ============================================================================
-- جدول معرض صور المنتجات (Product Images) - Marketna
-- يدعم الصور المتعددة، الربط بالمتغيرات، وتحديد صورة رئيسية واحدة
-- ============================================================================

CREATE TABLE public.product_images (
  -- المعرف الفريد
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- العلاقات (Foreign Keys)
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  
  -- بيانات الصورة
  url TEXT NOT NULL,
  alt_text TEXT,
  
  -- حالة الصورة الرئيسية (واحدة فقط لكل منتج)
  is_primary BOOLEAN DEFAULT false NOT NULL,
  
  -- ترتيب العرض في المعرض
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- الطوابع الزمنية
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.product_images IS 'معرض صور المنتجات، مع دعم الربط بالمتغيرات (مثل صورة اللون الأحمر)';
COMMENT ON COLUMN public.product_images.variant_id IS 'اختياري: ربط الصورة بمتغير محدد (NULL = صورة عامة للمنتج)';
COMMENT ON COLUMN public.product_images.is_primary IS 'الصورة الرئيسية للمنتج (واحدة فقط لكل منتج)';

-- ============================================================================
-- القيود (Constraints) لضمان سلامة البيانات
-- ============================================================================

-- التأكد من أن رابط الصورة ليس فارغاً
ALTER TABLE public.product_images 
ADD CONSTRAINT check_image_url_not_empty 
CHECK (length(trim(url)) > 0);

-- ✅ إزالة القيد الذي يسبب الخطأ (لا يمكن استخدام Subquery في CHECK)
-- سنستبدله بـ Trigger أدناه

-- ============================================================================
-- الفهارس (Indexes) لتحسين الأداء
-- ============================================================================

-- فهرس على product_id لعرض صور منتج معين
CREATE INDEX idx_images_product_id ON public.product_images(product_id);

-- فهرس على variant_id للبحث عن صور متغير محدد
CREATE INDEX idx_images_variant_id ON public.product_images(variant_id);

-- فهرس مركب لعرض صور المنتج بالترتيب (شائع جداً في الواجهة)
CREATE INDEX idx_images_product_order ON public.product_images(product_id, sort_order);

-- ✅ فهرس فريد جزئي: صورة رئيسية واحدة فقط لكل منتج
CREATE UNIQUE INDEX idx_images_primary_per_product 
ON public.product_images(product_id) 
WHERE is_primary = true;

-- فهرس للصور العامة (غير المرتبطة بمتغير)
CREATE INDEX idx_images_general 
ON public.product_images(product_id) 
WHERE variant_id IS NULL;

-- ============================================================================
-- دالة تحديث updated_at تلقائياً
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_product_images ON public.product_images;
CREATE TRIGGER set_updated_at_product_images 
  BEFORE UPDATE ON public.product_images 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ✅ Trigger ذكي: التحقق من أن variant_id ينتمي لنفس المنتج
-- هذا يحل مشكلة CHECK constraint الذي لا يدعم Subquery
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_variant_belongs_to_product()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا كان variant_id غير NULL، تحقق من أنه ينتمي لنفس المنتج
  IF NEW.variant_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.product_variants 
      WHERE id = NEW.variant_id 
      AND product_id = NEW.product_id
    ) THEN
      RAISE EXCEPTION 'variant_id must belong to the same product (product_id: %)', NEW.product_id
      USING ERRCODE = '23503';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_variant_belongs_to_product ON public.product_images;
CREATE TRIGGER trigger_validate_variant_belongs_to_product
  BEFORE INSERT OR UPDATE OF variant_id, product_id ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_variant_belongs_to_product();

-- ============================================================================
-- ✅ Trigger ذكي: ضمان صورة رئيسية واحدة فقط
-- عند تعيين صورة كـ primary، يتم إلغاء primary للصور الأخرى للمنتج نفسه
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا كانت الصورة الجديدة هي الرئيسية
  IF NEW.is_primary = true THEN
    -- إلغاء primary لجميع الصور الأخرى للمنتج نفسه
    UPDATE public.product_images
    SET is_primary = false
    WHERE product_id = NEW.product_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON public.product_images;
CREATE TRIGGER trigger_ensure_single_primary_image
  BEFORE INSERT OR UPDATE OF is_primary ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_primary_image();

-- ============================================================================
-- ✅ Trigger ذكي: مزامنة main_image_url مع جدول products
-- عند تغيير الصورة الرئيسية، يتم تحديث products.main_image_url تلقائياً
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_product_main_image()
RETURNS TRIGGER AS $$
BEGIN
  -- فقط إذا كانت الصورة الجديدة هي الرئيسية
  IF NEW.is_primary = true THEN
    UPDATE public.products
    SET 
      main_image_url = NEW.url,
      main_image_alt = NEW.alt_text
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_product_main_image ON public.product_images;
CREATE TRIGGER trigger_sync_product_main_image
  AFTER INSERT OR UPDATE OF is_primary, url, alt_text ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_main_image();

-- ============================================================================
-- تفعيل RLS وسياسات الأمان
-- ============================================================================

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Public read images of active products" ON public.product_images;
DROP POLICY IF EXISTS "Admin read all images" ON public.product_images;
DROP POLICY IF EXISTS "Admin manage all images" ON public.product_images;

-- 1. الزوار يرون صور المنتجات النشطة فقط
CREATE POLICY "Public read images of active products" ON public.product_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id 
    AND products.is_active = true
  )
);

-- 2. المدير يرى جميع الصور
CREATE POLICY "Admin read all images" ON public.product_images
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. المدير يدير جميع الصور
CREATE POLICY "Admin manage all images" ON public.product_images
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());