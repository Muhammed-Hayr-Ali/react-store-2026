-- Policies Creation File

-- =====================================================
-- Marketna E-Commerce - Roles Policies
-- File: 03_roles_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Security policies for roles table
-- Dependencies: public.roles, public.profile_roles
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Enable RLS
-- 2. Public read policy
-- 3. Admin management policy
-- =====================================================


-- =====================================================
-- 1️⃣ Enable RLS
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ Public Read Policy
-- =====================================================
-- Public read for all roles (view only)

DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
CREATE POLICY "roles_public_read"
  ON public.roles FOR SELECT
  TO authenticated, anon
  USING (true);

COMMENT ON POLICY "roles_public_read" ON public.roles IS 'Public read for all roles';


-- =====================================================
-- 3️⃣ Admin Management Policy
-- =====================================================
-- Only admins can manage roles

DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
CREATE POLICY "roles_admin_manage"
  ON public.roles FOR ALL
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

COMMENT ON POLICY "roles_admin_manage" ON public.roles IS 'Only admins can manage roles';


-- =====================================================
-- ✅ End of File
-- =====================================================
