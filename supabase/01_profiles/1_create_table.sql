-- =====================================================
-- Marketna E-Commerce - Profiles Schema
-- File: 02_profiles.sql
-- Version: 3.3 (Phase 1 - Basic Policies Only)
-- Date: 2026-03-22
-- Description: Profiles table - basic user information
-- Dependencies: auth.users (Supabase Auth)
-- =====================================================

-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- 🔹 سياسات Admin تم نقلها لـ Phase 2
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;

DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.update_profiles_updated_at() CASCADE;

DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_provider;
DROP INDEX IF EXISTS idx_profiles_created_at;
DROP INDEX IF EXISTS idx_profiles_last_sign_in;

DROP TABLE IF EXISTS public.profiles CASCADE;


-- =====================================================
-- 2️⃣ EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- 3️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT DEFAULT 'email',
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Comments
COMMENT ON TABLE public.profiles IS 'Profiles table - basic user information';
COMMENT ON COLUMN public.profiles.id IS 'Unique identifier (from auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.provider IS 'Authentication provider: email, google, github, etc.';
COMMENT ON COLUMN public.profiles.first_name IS 'First name';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name';
COMMENT ON COLUMN public.profiles.full_name IS 'Full name (auto-generated)';
COMMENT ON COLUMN public.profiles.phone IS 'Phone number';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether phone is verified';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL';
COMMENT ON COLUMN public.profiles.bio IS 'Biography';
COMMENT ON COLUMN public.profiles.email_verified IS 'Whether email is verified';
COMMENT ON COLUMN public.profiles.created_at IS 'Profile creation timestamp';
COMMENT ON COLUMN public.profiles.updated_at IS 'Profile last update timestamp';
COMMENT ON COLUMN public.profiles.last_sign_in_at IS 'Last sign-in timestamp';


-- =====================================================
-- 4️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_provider ON public.profiles(provider);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX idx_profiles_last_sign_in ON public.profiles(last_sign_in_at DESC);

COMMENT ON INDEX idx_profiles_email IS 'Search by email';
COMMENT ON INDEX idx_profiles_provider IS 'Search by authentication provider';
COMMENT ON INDEX idx_profiles_created_at IS 'Order by creation date';
COMMENT ON INDEX idx_profiles_last_sign_in IS 'Order by last sign-in';


-- =====================================================
-- 5️⃣ ROW LEVEL SECURITY (RLS) - Phase 1 Only
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own profile
-- =====================================================
CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- =====================================================
-- Policy 2: Users can update their own profile
-- =====================================================
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- Policy 3: Users can insert their own profile
-- =====================================================
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 🔹 سياسات Admin تم نقلها لـ Phase 2 (10_profiles_admin_policies.sql)


-- =====================================================
-- 6️⃣ TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();


-- =====================================================
-- 7️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Profiles table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profiles') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') AS policies,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'profiles_updated_at_trigger') AS triggers;


-- =====================================================
-- 8️⃣ PHASE 2 REMINDER
-- =====================================================
/*
📋 PHASE 2 - Admin Policies (Execute after all tables are created):

File: 10_profiles_admin_policies.sql

CREATE POLICY "profiles_admin_read_all"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.check_user_has_role('admin')
    OR id = auth.uid()
  );

CREATE POLICY "profiles_admin_manage"
  ON public.profiles FOR ALL TO authenticated
  USING (
    public.check_user_has_role('admin')
    OR id = auth.uid()
  )
  WITH CHECK (true);
*/