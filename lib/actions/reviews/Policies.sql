product_reviews_policies


-- ==========================================
-- 1. إزالة جميع السياسات السابقة المتعلقة بجدول product_reviews
-- ==========================================
DROP POLICY IF EXISTS "product_reviews_select_policy" ON "public"."product_reviews";
DROP POLICY IF EXISTS "product_reviews_insert_policy" ON "public"."product_reviews";
DROP POLICY IF EXISTS "product_reviews_update_policy" ON "public"."product_reviews";
DROP POLICY IF EXISTS "product_reviews_delete_policy" ON "public"."product_reviews";

-- (في حال كانت هناك أسماء قديمة أخرى للسياسات تم إنشاؤها مسبقاً)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."product_reviews";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."product_reviews";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "public"."product_reviews";
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."product_reviews";


-- ==========================================
-- 2. إضافة السياسات الجديدة بناءً على الصلاحيات الدقيقة (CRUD)
-- ==========================================

-- أ. سياسة القراءة (SELECT)
CREATE POLICY "product_reviews_select_policy"
ON "public"."product_reviews"
FOR SELECT
TO authenticated, anon
USING (true);

-- ب. سياسة الإضافة (INSERT)
CREATE POLICY "product_reviews_insert_policy"
ON "public"."product_reviews"
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) 
  OR public.has_permission('create_review'::text) 
  OR public.has_permission('manage_reviews'::text)
);

-- ج. سياسة التعديل (UPDATE)
CREATE POLICY "product_reviews_update_policy"
ON "public"."product_reviews"
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id) 
  OR public.has_permission('update_review'::text) 
  OR public.has_permission('manage_reviews'::text)
)
WITH CHECK (
  (auth.uid() = user_id) 
  OR public.has_permission('update_review'::text) 
  OR public.has_permission('manage_reviews'::text)
);

-- د. سياسة الحذف (DELETE)
CREATE POLICY "product_reviews_delete_policy"
ON "public"."product_reviews"
FOR DELETE
TO authenticated
USING (
  (auth.uid() = user_id) 
  OR public.has_permission('delete_review'::text) 
  OR public.has_permission('manage_reviews'::text)
);

-- ==========================================
-- 3. إعادة تحميل مخطط قاعدة البيانات لتطبيق التغييرات فوراً
-- ==========================================
NOTIFY pgrst, 'reload schema';