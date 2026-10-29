-- =========================================================
-- جدول product_reviews (تقييمات المنتجات)
-- =========================================================
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_reviews_select_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_policy" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_delete_policy" ON public.product_reviews;

-- أ) سياسة القراءة (SELECT): التقييمات المعتمدة للجميع، أو التقييم الخاص بالمستخدم، أو المشرفين
CREATE POLICY "product_reviews_select_policy" ON public.product_reviews 
FOR SELECT 
TO public 
USING (
  is_approved = true 
  OR auth.uid() = user_id 
  OR public.has_permission('manage_reviews'::text)
);

-- ب) سياسة الإدخال (INSERT): المستخدم المسجل يمكنه إضافة تقييم باسمه فقط
CREATE POLICY "product_reviews_insert_policy" ON public.product_reviews 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- ج) سياسة التحديث (UPDATE): صاحب التقييم يعدل محتواه، أو المشرف يعدل الاعتماد (is_approved)
CREATE POLICY "product_reviews_update_policy" ON public.product_reviews 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR public.has_permission('manage_reviews'::text)) 
WITH CHECK (auth.uid() = user_id OR public.has_permission('manage_reviews'::text));

-- د) سياسة الحذف (DELETE): صاحب التقييم أو المشرف
CREATE POLICY "product_reviews_delete_policy" ON public.product_reviews 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR public.has_permission('manage_reviews'::text));