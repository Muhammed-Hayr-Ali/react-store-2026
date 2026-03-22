-- =====================================================
-- Marketna E-Commerce - Profiles Policies (Secure)
-- File: 02_profiles_policies.sql
-- Version: 2.0
-- Date: 2026-03-21
-- Description: Security policies for profiles table - Secure version
-- Dependencies: public.profiles
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Enable RLS and revoke direct permissions
-- 2. Read policy: User reads their own full profile
-- 3. Read policy: Public info via secure VIEW
-- 4. UPDATE/INSERT/DELETE policies
-- 5. Create secure VIEW for public info
-- 6. Display info
-- =====================================================


-- =====================================================
-- 1️⃣ Enable RLS and Revoke Direct Permissions
-- =====================================================

-- Enable security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ⚠️ Revoke direct SELECT permission from public
-- To prevent direct table access and direct users to secure VIEW
REVOKE SELECT ON public.profiles FROM authenticated, anon;

-- Grant SELECT permission only to owner and admin (will be applied via policies)
GRANT SELECT ON public.profiles TO authenticated;


-- =====================================================
-- 2️⃣ Read Policy: User Reads Their Own Full Profile
-- =====================================================

-- User reads their own profile completely (all columns)
DROP POLICY IF EXISTS "profiles_read_own_full" ON public.profiles;
CREATE POLICY "profiles_read_own_full"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_read_own_full" ON public.profiles IS 'User reads their own profile completely';


-- =====================================================
-- 3️⃣ Read Policy: Public Info via Secure VIEW
-- =====================================================

-- ⚠️ Note: We don't put "public read" policy on the base table
-- Instead, we use a secure VIEW for public info only
-- Users query from: SELECT * FROM public.public_profiles


-- =====================================================
-- 4️⃣ UPDATE Policies
-- =====================================================

-- User updates their own profile only
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS 'User updates their own profile only';

-- ⚠️ Prevent users from modifying sensitive columns
-- (Can be applied via CHECK or in Backend)
-- Example: Prevent users from manually editing email_verified


-- =====================================================
-- 5️⃣ INSERT Policies
-- =====================================================

-- User creates their own profile (with ID matching auth.uid)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS 'User creates their own profile';

-- ✅ Recommended: Add Trigger to ensure id matches auth.uid()
-- See: 00_triggers.sql


-- =====================================================
-- 6️⃣ DELETE Policies
-- =====================================================

-- User deletes their own profile only
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_delete_own" ON public.profiles IS 'User deletes their own profile';


-- =====================================================
-- 7️⃣ Admin Policies (Manage All Profiles)
-- =====================================================

-- Admin reads all profiles
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

COMMENT ON POLICY "profiles_admin_read_all" ON public.profiles IS 'Admins read all profiles';

-- Admin manages all profiles
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

COMMENT ON POLICY "profiles_admin_manage_all" ON public.profiles IS 'Admins manage all profiles';


-- =====================================================
-- 8️⃣ Secure VIEW for Public Info Only
-- =====================================================

-- Drop old VIEW if exists
DROP VIEW IF EXISTS public.public_profiles;

-- Create secure VIEW with public info only
CREATE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

COMMENT ON VIEW public.public_profiles IS 'Secure VIEW for public info only - no sensitive data';

-- Grant SELECT on VIEW to everyone
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- ⚠️ Secure VIEW against modification
ALTER VIEW public.public_profiles OWNER TO postgres;


-- =====================================================
-- 9️⃣ Trigger: Protect Sensitive Columns on Update
-- =====================================================

-- Prevent users from modifying sensitive columns like email_verified
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modifying sensitive fields unless admin
  IF NEW.email_verified != OLD.email_verified
     AND NOT EXISTS (
       SELECT 1 FROM public.profile_roles pr
       JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = auth.uid()
         AND r.name = 'admin'
         AND pr.is_active = true
     )
  THEN
    NEW.email_verified := OLD.email_verified;  -- Restore old value
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
-- ✅ End of File
-- =====================================================

-- Display active policies
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

-- Display access summary
SELECT
  'profiles' AS table_name,
  COUNT(*) FILTER (WHERE polcmd = 'SELECT') AS select_policies,
  COUNT(*) FILTER (WHERE polcmd = 'UPDATE') AS update_policies,
  COUNT(*) FILTER (WHERE polcmd = 'INSERT') AS insert_policies,
  COUNT(*) FILTER (WHERE polcmd = 'DELETE') AS delete_policies
FROM pg_policy
WHERE polrelid = 'public.profiles'::regclass;
