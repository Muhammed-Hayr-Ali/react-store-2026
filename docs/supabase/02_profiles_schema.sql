-- ===============================================================================
-- File Name: 02_profiles_schema.sql
-- Description: Profiles table schema with RLS policies
-- Status: Active ✅
-- ===============================================================================

-- ===============================================================================
-- 1. Create Profiles Table
-- ===============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- المعلومات الأساسية
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- معلومات الاتصال
  phone TEXT,
  
  -- الاسم
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL THEN first_name
      WHEN last_name IS NOT NULL THEN last_name
      ELSE NULL
    END
  ) STORED,
  
  -- المعلومات الشخصية
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth DATE,
  bio TEXT,
  
  -- الصورة
  avatar_url TEXT,
  
  -- الإعدادات
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- حالة التحقق
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- التوقيتات
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================================================
-- 2. Create Indexes
-- ===============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);

-- ===============================================================================
-- 3. Enable Row Level Security (RLS)
-- ===============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================================================
-- 4. Create RLS Policies
-- ===============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do anything
CREATE POLICY "Service role can do anything"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true);

-- ===============================================================================
-- 5. Create Function: Handle New User Signup
-- ===============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    created_at,
    updated_at,
    last_login_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 6. Create Trigger: Auto-create Profile on Signup
-- ===============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===============================================================================
-- 7. Create Function: Update updated_at timestamp
-- ===============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- 8. Create Trigger: Auto-update updated_at
-- ===============================================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===============================================================================
-- 9. Create Function: Update last_login_at on login
-- ===============================================================================

CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL 
     AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
    UPDATE public.profiles
    SET last_login_at = NEW.last_sign_in_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- 10. Create Trigger: Update last_login_at on auth.users update
-- ===============================================================================

DROP TRIGGER IF EXISTS update_last_login_on_sign_in ON auth.users;

CREATE TRIGGER update_last_login_on_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_login();

-- ===============================================================================
-- End
-- ===============================================================================
