-- =========================================================
-- جدول brands (العلامات التجارية)
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

-- 3. السياسات المفصلة كل واحدة على حدة:

-- أ) سياسة القراءة (SELECT): متاحة للجميع (زوار ومسجلين) لعرض الماركات في المتجر
CREATE POLICY "brands_select_policy"
ON public.brands
FOR SELECT
TO public
USING (true);

-- ب) سياسة الإدخال (INSERT): محمية بصلاحية لوحة التحكم manage_brands فقط
CREATE POLICY "brands_insert_policy"
ON public.brands
FOR INSERT
TO authenticated
WITH CHECK (public.has_permission('manage_brands'::text));

-- ج) سياسة التحديث (UPDATE): محمية بصلاحية لوحة التحكم manage_brands فقط
CREATE POLICY "brands_update_policy"
ON public.brands
FOR UPDATE
TO authenticated
USING (public.has_permission('manage_brands'::text));

-- د) سياسة الحذف (DELETE): محمية بصلاحية لوحة التحكم manage_brands فقط
CREATE POLICY "brands_delete_policy"
ON public.brands
FOR DELETE
TO authenticated
USING (public.has_permission('manage_brands'::text));