-- =====================================================
-- Marketna E-Commerce - Plans RLS Policies
-- File: 05b_plans_rls_policies.sql
-- Version: 1.1 (Final)
-- Date: 2026-03-22
-- Description: Admin RLS policies for plans table
-- Dependencies: public.profile_roles, public.roles
-- Run AFTER: 04_profile_roles_links.sql
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup
-- 2. Admin read policy
-- 3. Admin manage policy (CRUD)
-- 4. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP POLICY IF EXISTS "plans_admin_read_all" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_manage" ON public.plans;


-- =====================================================
-- 2️⃣ ADMIN READ POLICY
-- =====================================================

CREATE POLICY "plans_admin_read_all"
  ON public.plans FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  );

COMMENT ON POLICY "plans_admin_read_all" ON public.plans IS 'Admins can read all plans';


-- =====================================================
-- 3️⃣ ADMIN MANAGE POLICY (CRUD)
-- =====================================================

CREATE POLICY "plans_admin_manage"
  ON public.plans FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "plans_admin_manage" ON public.plans IS 'Admins can manage all plans (CRUD)';


-- =====================================================
-- 4️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Admin policies created successfully!' AS status,
  COUNT(*) AS policy_count
FROM pg_policies 
WHERE tablename = 'plans' 
  AND policyname IN ('plans_admin_read_all', 'plans_admin_manage');
