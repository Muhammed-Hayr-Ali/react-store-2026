-- =====================================================
-- Marketna E-Commerce - Plans Admin Policies
-- File: 13_plans_admin_policies.sql
-- Version: 1.0 (Phase 2 - Final)
-- Date: 2026-03-22
-- Description: Admin policies for plans table
-- Dependencies: public.check_user_has_role() function
-- Run AFTER: Phase 1 complete + 03b_roles_functions.sql
-- =====================================================

-- ⚠️ CRITICAL: This file uses check_user_has_role() to avoid infinite recursion
-- DO NOT use direct SELECT FROM profile_roles in RLS policies

-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP POLICY IF EXISTS "plans_admin_read_all" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_manage" ON public.plans;


-- =====================================================
-- 2️⃣ ADMIN READ POLICY
-- 🔹 Uses check_user_has_role() to avoid recursion
-- =====================================================

CREATE POLICY "plans_admin_read_all"
  ON public.plans FOR SELECT TO authenticated
  USING (
    public.check_user_has_role('admin')
  );

COMMENT ON POLICY "plans_admin_read_all" ON public.plans 
  IS 'Admins can read all plans (uses check_user_has_role to avoid recursion)';


-- =====================================================
-- 3️⃣ ADMIN MANAGE POLICY (CRUD)
-- 🔹 Uses check_user_has_role() to avoid recursion
-- 🔹 WITH CHECK matches USING for consistency
-- =====================================================

CREATE POLICY "plans_admin_manage"
  ON public.plans FOR ALL TO authenticated
  USING (
    public.check_user_has_role('admin')
  )
  WITH CHECK (
    public.check_user_has_role('admin')
  );

COMMENT ON POLICY "plans_admin_manage" ON public.plans 
  IS 'Admins can manage all plans (CRUD) - uses check_user_has_role to avoid recursion';


-- =====================================================
-- 4️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Admin policies created successfully!' AS status,
  COUNT(*) AS policy_count
FROM pg_policies 
WHERE tablename = 'plans' 
  AND policyname IN ('plans_admin_read_all', 'plans_admin_manage');


-- =====================================================
-- 5️⃣ PHASE 2 PROGRESS
-- =====================================================
/*
📋 Phase 2 Admin Policies Progress:

┌───┬──────────────────────────────────────┬──────────┐
│ # │ File                                 │ Status   │
├───┼──────────────────────────────────────┼──────────┤
│ 1 │ 10_roles_admin_policies.sql          │ ✅       │
│ 2 │ 11_profiles_admin_policies.sql       │ ⏳       │
│ 3 │ 12_profile_roles_admin_policies.sql  │ ⏳       │
│ 4 │ 13_plans_admin_policies.sql          │ ✅ This  │
│ 5 │ 14_password_reset_admin_policies.sql │ ⏳       │
└───┴──────────────────────────────────────┴──────────┘
*/