-- =====================================================
-- Marketna E-Commerce - Complete Profiles Schema
-- File: 02_profiles_schema.sql
-- Version: 3.0 - All-in-One Schema
-- Date: 2026-03-19
-- Description: ملف شامل لإنشاء وتحديث جدول البروفايل بالكامل
-- =====================================================
-- تعليمات:
-- 1. افتح Supabase Dashboard
-- 2. اذهب إلى SQL Editor
-- 3. انسخ هذا الملف بالكامل
-- 4. الصق وشغّل (Run)
-- =====================================================

-- =====================================================
-- PART 1: MIGRATION - Add Provider Column
-- =====================================================

-- إضافة عمود provider إذا لم يكن موجوداً
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- إضافة تعليق على العمود
COMMENT ON COLUMN public.profiles.provider IS 'مزود المصادقة: email, google, facebook, github, apple, etc.';

-- إنشاء فهرس على عمود provider
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);

-- تحديث السجلات الموجودة لاستخراج provider من auth.users
UPDATE public.profiles p
SET provider = COALESCE(
  (SELECT au.raw_app_meta_data->>'provider'
   FROM auth.users au
   WHERE au.id = p.id),
  'email'
)
WHERE p.provider = 'email';

-- =====================================================
-- PART 2: TYPES (ENUMS)
-- =====================================================

DO $$ BEGIN
  -- النوع الاجتماعي
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
    CREATE TYPE gender AS ENUM ('male', 'female', 'prefer_not_to_say');
  END IF;
END $$;

-- =====================================================
-- PART 3: PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- === الهوية والربط ===
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,

  -- === مزود المصادقة ===
  provider TEXT DEFAULT 'email',

  -- === المعلومات الأساسية ===
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,

  -- === الأدوار والصلاحيات ===
  role TEXT DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,

  -- === بيانات التواصل ===
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,

  -- === التفضيلات ===
  language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Asia/Damascus',

  -- === الحالة والتواريخ ===
  email_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  gender gender,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_verified ON public.profiles(role, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON public.profiles(last_sign_in_at DESC);

-- =====================================================
-- PART 5: FUNCTIONS AND TRIGGERS
-- =====================================================

-- ---------------------------------------------------------------------
-- دالة إنشاء الملف الشخصي عند التسجيل (Fixed for Google OAuth)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء السجل في جدول profiles
  INSERT INTO public.profiles (
    id,
    email,
    provider,
    first_name,
    last_name,
    avatar_url,
    role,
    last_sign_in_at
  )
  SELECT
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    -- استخراج first_name
    CASE 
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'first_name' <> '' 
        THEN NEW.raw_user_meta_data->>'first_name'
      WHEN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name') <> '' 
        THEN SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), ' ', 1)
      ELSE ''
    END,
    -- استخراج last_name
    CASE 
      WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL AND NEW.raw_user_meta_data->>'last_name' <> '' 
        THEN NEW.raw_user_meta_data->>'last_name'
      WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) > 0
        THEN TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '') 
                     FROM POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) + 1))
      ELSE ''
    END,
    -- استخراج avatar_url
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', ''),
      ''
    ),
    'customer',
    NEW.last_sign_in_at;

  -- ✅ منح دور customer تلقائياً في جدول user_roles
  INSERT INTO public.user_roles (user_id, role_id, granted_by)
  SELECT
    NEW.id,
    r.id,
    NEW.id
  FROM public.roles r
  WHERE r.name = 'customer'
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- دالة تحديث التوقيت (updated_at)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- دالة تحديث آخر دخول
-- ---------------------------------------------------------------------
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

-- =====================================================
-- PART 6: PUBLIC READ FUNCTIONS
-- =====================================================

-- دالة للحصول على المعلومات العامة لمستخدم معين
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.role,
    p.is_verified,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على قائمة البائعين
CREATE OR REPLACE FUNCTION public.get_public_vendors()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.is_verified,
    p.created_at
  FROM public.profiles p
  WHERE p.role = 'vendor' AND p.is_verified = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_public_profile IS 'الحصول على المعلومات العامة لمستخدم معين';
COMMENT ON FUNCTION public.get_public_vendors IS 'الحصول على قائمة البائعين الموثوقين';

-- =====================================================
-- PART 7: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- === سياسات القراءة (SELECT) ===

-- 1. المستخدم يقرأ ملفه الشخصي بالكامل
DROP POLICY IF EXISTS "users_read_own" ON public.profiles;
CREATE POLICY "users_read_own" ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. المدير يقرأ جميع الملفات بالكامل
DROP POLICY IF EXISTS "admins_read_all" ON public.profiles;
CREATE POLICY "admins_read_all" ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role('admin'));

-- 3. المستخدمون المصادقون يقرأون المعلومات الأساسية للآخرين
DROP POLICY IF EXISTS "users_read_public_info" ON public.profiles;
CREATE POLICY "users_read_public_info" ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- 4. دعم فني يقرأ جميع الملفات
DROP POLICY IF EXISTS "support_read_all" ON public.profiles;
CREATE POLICY "support_read_all" ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role('support'));

-- === سياسات التعديل (UPDATE) ===

-- 1. المستخدم يعدل ملفه الشخصي فقط
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
CREATE POLICY "users_update_own" ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. المدير يعدل جميع الملفات
DROP POLICY IF EXISTS "admins_update_all" ON public.profiles;
CREATE POLICY "admins_update_all" ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role('admin'));

-- 3. دعم فني يعدل جميع الملفات
DROP POLICY IF EXISTS "support_update_all" ON public.profiles;
CREATE POLICY "support_update_all" ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role('support'));

-- === سياسات الإدراج (INSERT) ===

DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
CREATE POLICY "users_insert_own" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admins_insert_any" ON public.profiles;
CREATE POLICY "admins_insert_any" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role('admin'));

-- === سياسات الحذف (DELETE) ===

DROP POLICY IF EXISTS "users_delete_own" ON public.profiles;
CREATE POLICY "users_delete_own" ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "admins_delete_all" ON public.profiles;
CREATE POLICY "admins_delete_all" ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role('admin'));

-- =====================================================
-- PART 8: SECURITY VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  role,
  is_verified,
  created_at
FROM public.profiles;

COMMENT ON VIEW public.public_profiles IS 'عرض آمن للمعلومات العامة فقط (بدون بيانات حساسة)';

-- =====================================================
-- PART 9: EXISTING DATA FIX
-- =====================================================

-- تحديث first_name و last_name و avatar_url للمستخدمين الحاليين
UPDATE public.profiles p
SET
  first_name = COALESCE(
    p.first_name,
    CASE 
      WHEN au.raw_user_meta_data->>'first_name' IS NOT NULL AND au.raw_user_meta_data->>'first_name' <> '' 
        THEN au.raw_user_meta_data->>'first_name'
      WHEN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') <> '' 
        THEN SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'), ' ', 1)
      ELSE NULL
    END
  ),
  last_name = COALESCE(
    p.last_name,
    CASE 
      WHEN au.raw_user_meta_data->>'last_name' IS NOT NULL AND au.raw_user_meta_data->>'last_name' <> '' 
        THEN au.raw_user_meta_data->>'last_name'
      WHEN POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')) > 0
        THEN TRIM(SUBSTRING(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') 
                     FROM POSITION(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')) + 1))
      ELSE NULL
    END
  ),
  avatar_url = COALESCE(
    p.avatar_url,
    NULLIF(au.raw_user_meta_data->>'avatar_url', ''),
    NULLIF(au.raw_user_meta_data->>'picture', '')
  )
FROM auth.users au
WHERE au.id = p.id
  AND (p.first_name = '' OR p.first_name IS NULL OR p.last_name = '' OR p.last_name IS NULL);

-- =====================================================
-- END OF SCHEMA FILE
-- =====================================================
