-- =========================================================
-- جدول roles (الأدوار)
-- =========================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_insert_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_update_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_delete_policy" ON public.roles;

-- أ) سياسة القراءة (SELECT): متاح للمسجلين أو للجميع (حسب الحاجة لتطبيق الصلاحيات)
CREATE POLICY "roles_select_policy" ON public.roles 
FOR SELECT 
TO authenticated 
USING (true);

-- ب) سياسة الإدخال (INSERT): المشرفون الذين يملكون صلاحية manage_roles فقط
CREATE POLICY "roles_insert_policy" ON public.roles 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_permission('manage_roles'::text));

-- ج) سياسة التحديث (UPDATE): المشرفون فقط
CREATE POLICY "roles_update_policy" ON public.roles 
FOR UPDATE 
TO authenticated 
USING (public.has_permission('manage_roles'::text)) 
WITH CHECK (public.has_permission('manage_roles'::text));

-- د) سياسة الحذف (DELETE): المشرفون فقط
CREATE POLICY "roles_delete_policy" ON public.roles 
FOR DELETE 
TO authenticated 
USING (public.has_permission('manage_roles'::text));























-- =========================================================
-- جدول user_roles (ربط المستخدمين بالأدوار)
-- =========================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

-- أ) سياسة القراءة (SELECT): المستخدم يمكنه رؤية أدواره الخاصة، أو المشرف يرى أدوار الجميع
CREATE POLICY "user_roles_select_policy" ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR public.has_permission('manage_roles'::text));

-- ب) سياسة الإدخال (INSERT): المشرفون الذين يملكون صلاحية manage_roles فقط (تعيين أدوار للمستخدمين)
CREATE POLICY "user_roles_insert_policy" ON public.user_roles 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_permission('manage_roles'::text));

-- ج) سياسة التحديث (UPDATE): المشرفون فقط (تغيير دور المستخدم)
CREATE POLICY "user_roles_update_policy" ON public.user_roles 
FOR UPDATE 
TO authenticated 
USING (public.has_permission('manage_roles'::text)) 
WITH CHECK (public.has_permission('manage_roles'::text));

-- د) سياسة الحذف (DELETE): المشرفون فقط (سحب دور من المستخدم)
CREATE POLICY "user_roles_delete_policy" ON public.user_roles 
FOR DELETE 
TO authenticated 
USING (public.has_permission('manage_roles'::text));