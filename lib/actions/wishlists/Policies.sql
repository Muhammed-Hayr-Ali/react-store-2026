-- =========================================================
-- جدول wishlists (قائمة الرغبات)
-- =========================================================

-- 1. تفعيل الحماية
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "wishlists_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_select_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_insert_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_update_policy" ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_delete_policy" ON public.wishlists;

-- 3. السياسات المبنية على ملكية المستخدم (User Ownership):

-- أ) سياسة القراءة (SELECT): المستخدم يرى عناصر قائمة رغباته الخاصة فقط
CREATE POLICY "wishlists_select_policy"
ON public.wishlists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ب) سياسة الإدخال (INSERT): المستخدم يضيف منتجات لقائمة رغباته الخاصة فقط
CREATE POLICY "wishlists_insert_policy"
ON public.wishlists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ج) سياسة التحديث (UPDATE): المستخدم يعدل عناصر قائمة رغباته الخاصة فقط
CREATE POLICY "wishlists_update_policy"
ON public.wishlists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- د) سياسة الحذف (DELETE): المستخدم يحذف عناصر من قائمة رغباته الخاصة فقط
CREATE POLICY "wishlists_delete_policy"
ON public.wishlists
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);