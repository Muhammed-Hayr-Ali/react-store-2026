-- Policies Creation File

-- =====================================================
-- Marketna E-Commerce - Profile Roles Links Policies
-- File: 04_profile_roles_links_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Security policies for profile roles link table
-- Dependencies: public.profile_roles, public.roles
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Enable RLS
-- 2. User read policy
-- 3. Admin read policy
-- 4. Admin management policy
-- =====================================================


-- =====================================================
-- 1️⃣ Enable RLS
-- =====================================================

ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ User Read Policy
-- =====================================================
-- User reads their own active roles only

DROP POLICY IF EXISTS "profile_roles_read_own" ON public.profile_roles;
CREATE POLICY "profile_roles_read_own"
  ON public.profile_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND is_active = true
  );

COMMENT ON POLICY "profile_roles_read_own" ON public.profile_roles IS 'User reads their own active roles only';


-- =====================================================
-- 3️⃣ Admin Read Policy
-- =====================================================
-- Admins read all roles

DROP POLICY IF EXISTS "profile_roles_admin_read_all" ON public.profile_roles;
CREATE POLICY "profile_roles_admin_read_all"
  ON public.profile_roles FOR SELECT
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

COMMENT ON POLICY "profile_roles_admin_read_all" ON public.profile_roles IS 'Admins read all roles';


-- =====================================================
-- 4️⃣ Admin Management Policy
-- =====================================================
-- Only admins can manage roles

DROP POLICY IF EXISTS "profile_roles_admin_manage" ON public.profile_roles;
CREATE POLICY "profile_roles_admin_manage"
  ON public.profile_roles FOR ALL
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

COMMENT ON POLICY "profile_roles_admin_manage" ON public.profile_roles IS 'Only admins can manage roles';


-- =====================================================
-- ✅ End of File
-- =====================================================
