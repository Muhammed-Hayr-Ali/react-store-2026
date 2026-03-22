-- ملف إنشاء الدوال

-- =====================================================
-- Marketna E-Commerce - Profiles Functions
-- File: 02_profiles_functions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: دوال إدارة البروفايل
-- Dependencies: public.profiles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. دالة إنشاء البروفايل عند التسجيل
-- 2. دالة تحديث آخر دخول
-- =====================================================


-- =====================================================
-- 1️⃣ دالة إنشاء البروفايل عند التسجيل
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    provider,
    first_name,
    last_name,
    avatar_url,
    last_sign_in_at
  )
  SELECT
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    CASE
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'first_name' <> ''
        THEN NEW.raw_user_meta_data->>'first_name'
      WHEN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name') <> ''
        THEN SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), ' ', 1)
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL AND NEW.raw_user_meta_data->>'last_name' <> ''
        THEN NEW.raw_user_meta_data->>'last_name'
      WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) > 0
        THEN TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
                     FROM POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) + 1))
      ELSE NULL
    END,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', ''),
      NULL
    ),
    NEW.last_sign_in_at
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'إنشاء بروفايل جديد عند تسجيل مستخدم جديد';


-- =====================================================
-- 2️⃣ دالة تحديث آخر دخول
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NEW.last_sign_in_at,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

COMMENT ON FUNCTION public.handle_user_login IS 'تحديث وقت آخر تسجيل دخول';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================








  






