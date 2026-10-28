-- =========================================================
-- جدول brands (العلامات التجارية) - السياسات المُصححة
-- =========================================================

-- 1. تفعيل الحماية
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "brands_policy" ON public.brands;
DROP POLICY IF EXISTS "brands_all_policy" ON public.brands;
DROP POLICY IF EXISTS "brands_select_policy" ON public.brands;
DROP POLICY IF EXISTS "brands_insert_policy" ON public.brands;
DROP POLICY IF EXISTS "brands_update_policy" ON public.brands;
DROP POLICY IF EXISTS "brands_delete_policy" ON public.brands;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.brands;
DROP POLICY IF EXISTS "Allow public read access" ON public.brands;

-- 3. السياسات الجديدة المحدثة:

-- أ) سياسة القراءة (SELECT): متاحة للجميع
CREATE POLICY "brands_select_policy"
ON public.brands
FOR SELECT
TO public
USING (true);

-- ب) سياسة الإدخال (INSERT): محمية بالصلاحية
CREATE POLICY "brands_insert_policy"
ON public.brands
FOR INSERT
TO authenticated
WITH CHECK (public.has_permission('manage_brands'::text));

-- ج) سياسة التحديث (UPDATE): محمية بالصلاحية (مع USING و WITH CHECK معاً)
CREATE POLICY "brands_update_policy"
ON public.brands
FOR UPDATE
TO authenticated
USING (public.has_permission('manage_brands'::text))
WITH CHECK (public.has_permission('manage_brands'::text));

-- د) سياسة الحذف (DELETE): محمية بالصلاحية
CREATE POLICY "brands_delete_policy"
ON public.brands
FOR DELETE
TO authenticated
USING (public.has_permission('manage_brands'::text));