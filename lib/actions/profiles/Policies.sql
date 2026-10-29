-- =========================================================
-- جدول profiles (الملفات الشخصية)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- أ) سياسة القراءة (SELECT): المستخدم يرى ملفه الشخصي، أو المشرف يرى كل الملفات
CREATE POLICY "profiles_select_policy" ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR public.has_permission('manage_users'::text) OR public.has_permission('view_users_management'::text));

-- ب) سياسة الإدخال (INSERT): النظام (أو السجل الذاتي عند التسجيل)
CREATE POLICY "profiles_insert_policy" ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id OR public.has_permission('manage_users'::text));

-- ج) سياسة التحديث (UPDATE): المستخدم يحدث ملفه الشخصي، أو المشرف يدير الحسابات (الحظر والحالة)
CREATE POLICY "profiles_update_policy" ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id OR public.has_permission('manage_users'::text)) 
WITH CHECK (auth.uid() = id OR public.has_permission('manage_users'::text));

-- د) سياسة الحذف (DELETE): المشرفون فقط
CREATE POLICY "profiles_delete_policy" ON public.profiles 
FOR DELETE 
TO authenticated 
USING (public.has_permission('manage_users'::text));