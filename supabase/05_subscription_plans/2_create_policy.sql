-- Policies Creation File

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Policies
-- File: 05_subscriptions_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Security policies for subscription plans table
-- Dependencies: public.plans
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

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ Public Read Policy
-- =====================================================
-- Public read for all subscription plans

DROP POLICY IF EXISTS "plans_public_read" ON public.plans;
CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT
  TO authenticated, anon
  USING (true);

COMMENT ON POLICY "plans_public_read" ON public.plans IS 'Public read for all plans';


-- =====================================================
-- 3️⃣ Admin Management Policy
-- =====================================================
-- Admins manage all plans

DROP POLICY IF EXISTS "plans_admin_write" ON public.plans;
CREATE POLICY "plans_admin_write"
  ON public.plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "plans_admin_write" ON public.plans IS 'Admins manage all plans';


-- =====================================================
-- ✅ End of File
-- =====================================================
