-- Policies Creation File

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Policies
-- File: 01_password_reset_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Security policies for password reset tokens table
-- Dependencies: public.password_reset_tokens
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Enable RLS
-- 2. Prevent public read policy
-- 3. Backend service full access policy
-- =====================================================


-- =====================================================
-- 1️⃣ Enable RLS
-- =====================================================

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ Prevent Public Read Policy
-- =====================================================
-- Prevents any read from any user (even authenticated)

DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);

COMMENT ON POLICY "password_reset_tokens_no_public_read" ON public.password_reset_tokens IS 'Prevent any public read - tokens are completely secret';


-- =====================================================
-- 3️⃣ Backend Service Full Access Policy
-- =====================================================
-- Allows only backend service (Service Role) full access

DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "password_reset_tokens_service_full_access" ON public.password_reset_tokens IS 'Only backend service has full access';


-- =====================================================
-- ✅ End of File
-- =====================================================
