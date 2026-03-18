-- =====================================================
-- Marketna E-Commerce - Profiles Schema (Corrected)
-- =====================================================

-- 1. ENUMS (استخدام DO $$ لتجنب أخطاء التكرار)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
    CREATE TYPE gender AS ENUM ('male', 'female', 'prefer_not_to_say');
  END IF;
END $$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,
  gender gender,
  date_of_birth DATE,
  bio TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'ar',
  timezone TEXT DEFAULT 'Asia/Riyadh',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW());

-- 3. FUNCTIONS & TRIGGERS

-- دالة إنشاء الملف الشخصي عند التسجيل (Security Definer لضمان الصلاحيات)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- المشغل عند التسجيل
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة تحديث التوقيت تلقائياً عند أي تعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ملاحظة: تم حذف "IF NOT EXISTS" لأن PostgreSQL لا تدعمها مع CREATE POLICY
-- نقوم بحذف السياسة أولاً لتجنب خطأ التكرار (Duplicate Object)
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id); -- تم التعديل للخصوصية: المستخدم يرى ملفه فقط

DROP POLICY IF EXISTS "profiles_user_update_own" ON profiles;
CREATE POLICY "profiles_user_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);





  

-- لا حاجة لسياسة INSERT لأن الـ Trigger يعمل بصلاحيات النظام

-- =====================================================
-- 5. LAST LOGIN AUTOMATION (تحديث حقل آخر دخول تلقائياً)
-- =====================================================

-- دالة لتحديث last_login_at في جدول profiles
-- عندما يقوم Supabase بتحديث last_sign_in_at في جدول auth.users
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث حقل last_login_at في جدول profiles للمستخدم المطابق
  UPDATE public.profiles
  SET last_login_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- المشغل (Trigger) الذي يعمل عند تحديث بيانات المستخدم في auth.users
-- ملاحظة: Supabase يقوم بتحديث حقل last_sign_in_at تلقائياً عند كل تسجيل دخول
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

COMMENT ON FUNCTION public.handle_user_login() IS 'دالة لتحديث وقت آخر دخول في جدول profiles تلقائياً عند تسجيل الدخول';
