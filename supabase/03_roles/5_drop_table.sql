-- Table Drop File

-- =====================================================
-- Marketna E-Commerce - Roles Drop
-- File: drop_roles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Drop roles table
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

DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
DROP POLICY IF EXISTS "roles_public_read" ON public.roles;


-- =====================================================
-- 2️⃣ Drop Functions
-- =====================================================
-- No functions for this table


-- =====================================================
-- 3️⃣ Drop Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_roles_created_at;
DROP INDEX IF EXISTS idx_roles_permissions;
DROP INDEX IF EXISTS idx_roles_name;


-- =====================================================
-- 4️⃣ Drop Data
-- =====================================================

DELETE FROM public.roles;


-- =====================================================
-- 5️⃣ Drop Table
-- =====================================================

DROP TABLE IF EXISTS public.roles CASCADE;


-- =====================================================
-- 6️⃣ Drop ENUM Type
-- =====================================================

DROP TYPE IF EXISTS public.role_name CASCADE;


-- =====================================================
-- ✅ End of File
-- =====================================================
