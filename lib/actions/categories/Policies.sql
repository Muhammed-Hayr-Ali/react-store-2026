-- =========================================================
-- جدول categories (التصنيفات)
-- =========================================================

-- 1. تفعيل الحماية
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "categories_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_all_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access" ON public.categories;

-- 3. السياسات المفصلة:

-- أ) سياسة القراءة (SELECT): متاحة للجميع لعرض التصنيفات في المتجر
CREATE POLICY "categories_select_policy"
ON public.categories
FOR SELECT
TO public
USING (true);

-- ب) سياسة الإدخال (INSERT): محمية بصلاحية manage_categories فقط
CREATE POLICY "categories_insert_policy"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_permission('manage_categories'::text));

-- ج) سياسة التحديث (UPDATE): محمية بصلاحية manage_categories فقط
CREATE POLICY "categories_update_policy"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.has_permission('manage_categories'::text))
WITH CHECK (public.has_permission('manage_categories'::text));

-- د) سياسة الحذف (DELETE): محمية بصلاحية manage_categories فقط
CREATE POLICY "categories_delete_policy"
ON public.categories
FOR DELETE
TO authenticated
USING (public.has_permission('manage_categories'::text));