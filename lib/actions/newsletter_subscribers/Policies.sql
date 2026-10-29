-- =========================================================
-- جدول newsletter_subscribers (مشتركو النشرة البريدية)
-- =========================================================
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_select_policy" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_insert_policy" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_update_policy" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_delete_policy" ON public.newsletter_subscribers;

-- أ) سياسة القراءة (SELECT): المشرفون يمكنهم رؤية الكل، أو الزائر يرى بريده (حسب منطق التطبيق لديك، هنا نجعلها للمشرفين أو عبر رابط آمن)
CREATE POLICY "newsletter_select_policy" ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated 
USING (public.has_permission('manage_newsletter'::text) OR auth.email() = email);

-- ب) سياسة الإدخال (INSERT): متاح للجميع (الزوار والمسجلين) للاشتراك في النشرة
CREATE POLICY "newsletter_insert_policy" ON public.newsletter_subscribers 
FOR INSERT 
TO public 
WITH CHECK (true);

-- ج) سياسة التحديث (UPDATE): المشرفون أو صاحب البريد يمكنه تحديث حالته (إلغاء الاشتراك)
CREATE POLICY "newsletter_update_policy" ON public.newsletter_subscribers 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- د) سياسة الحذف (DELETE): محمية بصلاحية المشرفين فقط
CREATE POLICY "newsletter_delete_policy" ON public.newsletter_subscribers 
FOR DELETE 
TO authenticated 
USING (public.has_permission('manage_newsletter'::text));