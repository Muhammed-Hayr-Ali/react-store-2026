-- ملف حذف الجدول

-- =====================================================
-- Marketna E-Commerce - Profiles Drop
-- File: drop_profiles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: حذف جدول البروفايل
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. حذف العرض (View)
-- 2. حذف السياسات (Policies)
-- 3. حذف المحفزات (Triggers)
-- 4. حذف الدوال (Functions)
-- 5. حذف الفهارس (Indexes)
-- 6. حذف الجدول (Table)
-- =====================================================


-- =====================================================
-- 1️⃣ حذف العرض (View)
-- =====================================================

DROP VIEW IF EXISTS public.public_profiles CASCADE;


-- =====================================================
-- 2️⃣ حذف السياسات (Policies)
-- =====================================================

DROP POLICY IF EXISTS "users_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
DROP POLICY IF EXISTS "users_read_public_info" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own" ON public.profiles;


-- =====================================================
-- 3️⃣ حذف المحفزات (Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- =====================================================
-- 4️⃣ حذف الدوال (Functions)
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_user_login();
DROP FUNCTION IF EXISTS public.handle_new_user();


-- =====================================================
-- 5️⃣ حذف الفهارس (Indexes)
-- =====================================================

DROP INDEX IF EXISTS idx_profiles_last_sign_in;
DROP INDEX IF EXISTS idx_profiles_created_at;
DROP INDEX IF EXISTS idx_profiles_provider;
DROP INDEX IF EXISTS idx_profiles_email;


-- =====================================================
-- 6️⃣ حذف الجدول (Table)
-- =====================================================

DROP TABLE IF EXISTS public.profiles CASCADE;


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
