-- Table Drop File

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Drop
-- File: drop_subscriptions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Drop subscription plans table
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Drop Policies
-- 2. Drop Functions
-- 3. Drop Indexes
-- 4. Drop Data
-- 5. Drop Table
-- 6. Drop ENUM Type
-- =====================================================


-- =====================================================
-- 1️⃣ Drop Policies
-- =====================================================

DROP POLICY IF EXISTS "plans_admin_write" ON public.plans;
DROP POLICY IF EXISTS "plans_public_read" ON public.plans;


-- =====================================================
-- 2️⃣ Drop Functions
-- =====================================================
-- No functions for this table


-- =====================================================
-- 3️⃣ Drop Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_plans_permissions;
DROP INDEX IF EXISTS idx_plans_category;


-- =====================================================
-- 4️⃣ Drop Data
-- =====================================================

DELETE FROM public.plans;


-- =====================================================
-- 5️⃣ Drop Table
-- =====================================================

DROP TABLE IF EXISTS public.plans CASCADE;


-- =====================================================
-- 6️⃣ Drop ENUM Type
-- =====================================================

DROP TYPE IF EXISTS plan_category CASCADE;


-- =====================================================
-- ✅ End of File
-- =====================================================
