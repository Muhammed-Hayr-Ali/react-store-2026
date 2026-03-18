-- =====================================================
-- Marketna E-Commerce - Profiles Schema
-- File: 02_profiles_schema.sql
-- Dependencies: 01_roles_permissions_system.sql
-- =====================================================

-- 1. أنواع البيانات (ENUMS)
DO $$ BEGIN
  -- النوع الاجتماعي
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
    CREATE TYPE gender AS ENUM ('male', 'female', 'prefer_not_to_say');
  END IF;
END $$;

-- 2. جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  -- === الهوية والربط ===
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  
  -- === المعلومات الأساسية ===
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,
  
  -- === الأدوار والصلاحيات ===
  -- ملاحظة: نستخدم TEXT للتوافق مع جدول roles
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

-- 3. الفهرسة (Indexing)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_role_verified ON public.profiles(role, is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON public.profiles(last_sign_in_at DESC);

-- =====================================================
-- 4. دوال ومشغلات النظام (Functions & Triggers)
-- =====================================================

-- دالة إنشاء الملف الشخصي عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, avatar_url, role, last_sign_in_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'customer', -- دور افتراضي
    NEW.last_sign_in_at
  );
  
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة تحديث التوقيت (updated_at)
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

-- دالة تحديث آخر دخول
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_sign_in_at = NEW.last_sign_in_at, updated_at = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- =====================================================
-- 5. دوال مساعدة للقراءة العامة (Public Read Functions)
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
-- 6. سياسات الأمان (Row Level Security)
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
-- 7. عرض آمن للمعلومات العامة (Security View)
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