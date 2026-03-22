-- =====================================================
-- Marketna E-Commerce - Profiles Policies (Secure)
-- File: 02_profiles_policies.sql
-- Version: 2.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول البروفايل - نسخة مؤمنة
-- Dependencies: public.profiles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS وإزالة الصلاحيات المباشرة
-- 2. سياسة القراءة: المستخدم يقرأ ملفه الكامل
-- 3. سياسة القراءة: معلومات عامة عبر VIEW آمن
-- 4. سياسات التعديل/الإدراج/الحذف
-- 5. إنشاء VIEW آمن للمعلومات العامة
-- 6. عرض المعلومات
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS وإزالة الصلاحيات المباشرة
-- =====================================================

-- تفعيل الأمان
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ⚠️ إزالة صلاحية القراءة المباشرة من public
-- لمنع الوصول المباشر للجدول وتوجيه المستخدمين للـ VIEW الآمن
REVOKE SELECT ON public.profiles FROM authenticated, anon;

-- منح صلاحية القراءة فقط للمالك والمدير (سيتم تطبيقها عبر السياسات)
GRANT SELECT ON public.profiles TO authenticated;


-- =====================================================
-- 2️⃣ سياسة القراءة: المستخدم يقرأ ملفه الكامل
-- =====================================================

-- المستخدم يقرأ ملفه الشخصي بالكامل (جميع الأعمدة)
DROP POLICY IF EXISTS "profiles_read_own_full" ON public.profiles;
CREATE POLICY "profiles_read_own_full"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_read_own_full" ON public.profiles IS 'المستخدم يقرأ ملفه الشخصي بالكامل';


-- =====================================================
-- 3️⃣ سياسة القراءة: معلومات عامة عبر VIEW آمن
-- =====================================================

-- ⚠️ ملاحظة: لا نضع سياسة "قراءة عامة" على الجدول الأساسي
-- بدلاً من ذلك، نستخدم VIEW آمن للمعلومات العامة فقط
-- المستخدمون يستعلمون من: SELECT * FROM public.public_profiles


-- =====================================================
-- 4️⃣ سياسات التعديل (UPDATE)
-- =====================================================

-- المستخدم يعدل ملفه الشخصي فقط
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'المستخدم يعدل ملفه الشخصي فقط';

-- ⚠️ منع تعديل أعمدة حساسة من قبل المستخدم
-- (يمكن تطبيقها عبر CHECK أو تطبيق في الـ Backend)
-- مثال: منع المستخدم من تعديل email_verified يدوياً


-- =====================================================
-- 5️⃣ سياسات الإدراج (INSERT)
-- =====================================================

-- المستخدم ينشئ ملفه الشخصي (مع تطابق ID مع auth.uid)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'المستخدم ينشئ ملفه الشخصي';

-- ✅ موصى به: إضافة Trigger لضمان تطابق id مع auth.uid()
-- انظر: 00_triggers.sql


-- =====================================================
-- 6️⃣ سياسات الحذف (DELETE)
-- =====================================================

-- المستخدم يحذف ملفه الشخصي فقط
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_delete_own" ON public.profiles IS 'المستخدم يحذف ملفه الشخصي';


-- =====================================================
-- 7️⃣ سياسات المدير (إدارة جميع البروفايلات)
-- =====================================================

-- المدير يقرأ جميع البروفايلات
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
CREATE POLICY "profiles_admin_read_all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profile_roles pr
      JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid()
        AND r.name = 'admin'
        AND pr.is_active = true
    )
  );

COMMENT ON POLICY "profiles_admin_read_all" ON public.profiles IS 'المدراء يقرأون جميع البروفايلات';

-- المدير يدير جميع البروفايلات
DROP POLICY IF EXISTS "profiles_admin_manage_all" ON public.profiles;
CREATE POLICY "profiles_admin_manage_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profile_roles pr
      JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid()
        AND r.name = 'admin'
        AND pr.is_active = true
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "profiles_admin_manage_all" ON public.profiles IS 'المدراء يديرون جميع البروفايلات';


-- =====================================================
-- 8️⃣ VIEW آمن للمعلومات العامة فقط
-- =====================================================

-- حذف الـ VIEW القديم إذا وجد
DROP VIEW IF EXISTS public.public_profiles;

-- إنشاء VIEW آمن يحتوي على المعلومات العامة فقط
CREATE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

COMMENT ON VIEW public.public_profiles IS 'عرض آمن للمعلومات العامة فقط - لا يحتوي على بيانات حساسة';

-- منح صلاحية القراءة على الـ VIEW للجميع
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- ⚠️ تأمين الـ VIEW ضد التعديل
ALTER VIEW public.public_profiles OWNER TO postgres;


-- =====================================================
-- 9️⃣ Trigger: حماية الأعمدة الحساسة عند التحديث
-- =====================================================

-- منع المستخدم من تعديل أعمدة حساسة مثل email_verified
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- منع تعديل الحقول الحساسة إلا بواسطة المدير
  IF NEW.email_verified != OLD.email_verified 
     AND NOT EXISTS (
       SELECT 1 FROM public.profile_roles pr
       JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = auth.uid()
         AND r.name = 'admin'
         AND pr.is_active = true
     )
  THEN
    NEW.email_verified := OLD.email_verified;  -- استعادة القيمة القديمة
  END IF;
  
  IF NEW.phone_verified != OLD.phone_verified 
     AND NOT EXISTS (
       SELECT 1 FROM public.profile_roles pr
       JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = auth.uid()
         AND r.name = 'admin'
         AND pr.is_active = true
     )
  THEN
    NEW.phone_verified := OLD.phone_verified;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_sensitive_fields ON public.profiles;
CREATE TRIGGER protect_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sensitive_profile_fields();


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

-- عرض السياسات المفعّلة
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_condition,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- عرض ملخص الوصول
SELECT 
  'profiles' AS table_name,
  COUNT(*) FILTER (WHERE polcmd = 'SELECT') AS select_policies,
  COUNT(*) FILTER (WHERE polcmd = 'UPDATE') AS update_policies,
  COUNT(*) FILTER (WHERE polcmd = 'INSERT') AS insert_policies,
  COUNT(*) FILTER (WHERE polcmd = 'DELETE') AS delete_policies
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass;
