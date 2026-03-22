-- Table Drop File

-- =====================================================
-- Marketna E-Commerce - Profile Plans Links Drop
-- File: drop_profile_plans_links.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Drop profile plans link table
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Drop Policies
-- 2. Drop Functions
-- 3. Drop Indexes
-- 4. Drop Data
-- 5. Drop Table
-- =====================================================


-- =====================================================
-- 1️⃣ Drop Policies
-- =====================================================

DROP POLICY IF EXISTS "profile_plans_manage_own" ON public.profile_plans;
DROP POLICY IF EXISTS "profile_plans_read_own" ON public.profile_plans;


-- =====================================================
-- 2️⃣ Drop Functions
-- =====================================================
-- No functions for this table


-- =====================================================
-- 3️⃣ Drop Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_profile_plans_status;
DROP INDEX IF EXISTS idx_profile_plans_plan;
DROP INDEX IF EXISTS idx_profile_plans_user;
DROP INDEX IF EXISTS idx_profile_plans_active_unique;


-- =====================================================
-- 4️⃣ Drop Data
-- =====================================================

DELETE FROM public.profile_plans;


-- =====================================================
-- 5️⃣ Drop Table
-- =====================================================

DROP TABLE IF EXISTS public.profile_plans CASCADE;


-- =====================================================
-- ✅ End of File
-- =====================================================
