-- =========================================================
-- جدول product_reviews (تقييمات المنتجات)
-- =========================================================

-- 1. تفعيل الحماية وتعيين القيم الافتراضية تلقائياً
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. تنظيف كافة السياسات القديمة لتجنب أي تضارب
DROP POLICY IF EXISTS "product_reviews_owner_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_all_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_select_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_delete_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_reviews;

-- 3. السياسات المفصلة كل واحدة على حدة:

-- أ) سياسة القراءة (SELECT): 
-- متاحة للجميع (الزوار والمسجلين) بشرط أن يكون التقييم معتمداً، أو أن القارئ هو صاحب التقييم نفسه
CREATE POLICY "product_reviews_select_policy"
ON public.product_reviews
FOR SELECT
TO public
USING (
  is_approved = true 
  OR user_id = auth.uid()
);

-- ب) سياسة الإدخال (INSERT): 
-- للمستخدمين المسجلين فقط، سلسة وتعتمد على DEFAULT auth.uid()
CREATE POLICY "product_reviews_insert_policy"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ج) سياسة التحديث (UPDATE): 
-- المستخدم يعدل تقييمه الخاص فقط
CREATE POLICY "product_reviews_update_policy"
ON public.product_reviews
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- د) سياسة الحذف (DELETE): 
-- المستخدم يحذف تقييمه الخاص فقط
CREATE POLICY "product_reviews_delete_policy"
ON public.product_reviews
FOR DELETE
TO authenticated
USING (user_id = auth.uid());