-- Table Drop File

-- =====================================================
-- Marketna E-Commerce - Profile Roles Links Drop
-- File: drop_profile_roles_links.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Drop profile roles link table
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

DROP POLICY IF EXISTS "profile_roles_admin_manage" ON public.profile_roles;
DROP POLICY IF EXISTS "profile_roles_admin_read_all" ON public.profile_roles;
DROP POLICY IF EXISTS "profile_roles_read_own" ON public.profile_roles;


-- =====================================================
-- 2️⃣ Drop Functions
-- =====================================================
-- No functions for this table


-- =====================================================
-- 3️⃣ Drop Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_profile_roles_active;
DROP INDEX IF EXISTS idx_profile_roles_role;
DROP INDEX IF EXISTS idx_profile_roles_user;


-- =====================================================
-- 4️⃣ Drop Data
-- =====================================================

DELETE FROM public.profile_roles;


-- =====================================================
-- 5️⃣ Drop Table
-- =====================================================

DROP TABLE IF EXISTS public.profile_roles CASCADE;


-- =====================================================
-- ✅ End of File
-- =====================================================
