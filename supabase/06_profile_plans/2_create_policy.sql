-- Policies Creation File

-- =====================================================
-- Marketna E-Commerce - Profile Plans Links Policies
-- File: 06_profile_plans_links_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Security policies for profile plans link table
-- Dependencies: public.profile_plans
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Enable RLS
-- 2. User read policy
-- 3. User management policy
-- =====================================================


-- =====================================================
-- 1️⃣ Enable RLS
-- =====================================================

ALTER TABLE public.profile_plans ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ User Read Policy
-- =====================================================
-- User reads their own plan only

DROP POLICY IF EXISTS "profile_plans_read_own" ON public.profile_plans;
CREATE POLICY "profile_plans_read_own"
  ON public.profile_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON POLICY "profile_plans_read_own" ON public.profile_plans IS 'User reads their own plan only';


-- =====================================================
-- 3️⃣ User Management Policy
-- =====================================================
-- User manages their own plan only

DROP POLICY IF EXISTS "profile_plans_manage_own" ON public.profile_plans;
CREATE POLICY "profile_plans_manage_own"
  ON public.profile_plans FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY "profile_plans_manage_own" ON public.profile_plans IS 'User manages their own plan only';


-- =====================================================
-- ✅ End of File
-- =====================================================
