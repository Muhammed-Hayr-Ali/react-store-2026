-- Table Drop File

-- =====================================================
-- Marketna E-Commerce - Profiles Drop
-- File: drop_profiles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Drop profiles table
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Drop View
-- 2. Drop Policies
-- 3. Drop Triggers
-- 4. Drop Functions
-- 5. Drop Indexes
-- 6. Drop Table
-- =====================================================


-- =====================================================
-- 1️⃣ Drop View
-- =====================================================

DROP VIEW IF EXISTS public.public_profiles CASCADE;


-- =====================================================
-- 2️⃣ Drop Policies
-- =====================================================

DROP POLICY IF EXISTS "users_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.profiles;
DROP POLICY IF EXISTS "users_read_public_info" ON public.profiles;
DROP POLICY IF EXISTS "users_read_own" ON public.profiles;


-- =====================================================
-- 3️⃣ Drop Triggers
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- =====================================================
-- 4️⃣ Drop Functions
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_user_login();
DROP FUNCTION IF EXISTS public.handle_new_user();


-- =====================================================
-- 5️⃣ Drop Indexes
-- =====================================================

DROP INDEX IF EXISTS idx_profiles_last_sign_in;
DROP INDEX IF EXISTS idx_profiles_created_at;
DROP INDEX IF EXISTS idx_profiles_provider;
DROP INDEX IF EXISTS idx_profiles_email;


-- =====================================================
-- 6️⃣ Drop Table
-- =====================================================

DROP TABLE IF EXISTS public.profiles CASCADE;


-- =====================================================
-- ✅ End of File
-- =====================================================
