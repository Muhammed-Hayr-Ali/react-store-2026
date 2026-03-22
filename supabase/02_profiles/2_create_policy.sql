-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Profiles Policies
-- File: 02_profiles_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول البروفايل
-- Dependencies: public.profiles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS
-- 2. سياسات القراءة (SELECT)
-- 3. سياسات التعديل (UPDATE)
-- 4. سياسات الإدراج (INSERT)
-- 5. سياسات الحذف (DELETE)
-- 6. عرض المعلومات العامة
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسات القراءة (SELECT)
-- =====================================================

-- المستخدم يقرأ ملفه الشخصي بالكامل
DROP POLICY IF EXISTS "users_read_own" ON public.profiles;
CREATE POLICY "users_read_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "users_read_own" ON public.profiles IS 'المستخدم يقرأ ملفه الشخصي بالكامل';

-- المستخدمون المصادقون يقرأون المعلومات العامة للآخرين
DROP POLICY IF EXISTS "users_read_public_info" ON public.profiles;
CREATE POLICY "users_read_public_info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON POLICY "users_read_public_info" ON public.profiles IS 'قراءة المعلومات العامة للمستخدمين الآخرين';


-- =====================================================
-- 3️⃣ سياسات التعديل (UPDATE)
-- =====================================================

-- المستخدم يعدل ملفه الشخصي فقط
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
CREATE POLICY "users_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "users_update_own" ON public.profiles IS 'المستخدم يعدل ملفه الشخصي فقط';


-- =====================================================
-- 4️⃣ سياسات الإدراج (INSERT)
-- =====================================================

DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
CREATE POLICY "users_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "users_insert_own" ON public.profiles IS 'المستخدم ينشئ ملفه الشخصي';


-- =====================================================
-- 5️⃣ سياسات الحذف (DELETE)
-- =====================================================

DROP POLICY IF EXISTS "users_delete_own" ON public.profiles;
CREATE POLICY "users_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "users_delete_own" ON public.profiles IS 'المستخدم يحذف ملفه الشخصي';


-- =====================================================
-- 6️⃣ عرض المعلومات العامة (Public Profiles View)
-- =====================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

COMMENT ON VIEW public.public_profiles IS 'عرض آمن للمعلومات العامة فقط';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
