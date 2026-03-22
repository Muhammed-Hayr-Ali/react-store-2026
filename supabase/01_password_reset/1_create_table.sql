-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- File: 01_password_reset_tokens.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Secure password reset system
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Create password reset tokens table
-- 2. Indexes
-- 3. Descriptive comments
-- =====================================================


-- =====================================================
-- 1️⃣ Create Password Reset Tokens Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.password_reset_tokens IS 'Password reset tokens - valid for 60 minutes';
COMMENT ON COLUMN public.password_reset_tokens.id IS 'Unique identifier for the token';
COMMENT ON COLUMN public.password_reset_tokens.user_id IS 'Target user ID (from auth.users)';
COMMENT ON COLUMN public.password_reset_tokens.email IS 'User email address';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'Secret token (64 alphanumeric characters)';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'Expiration time';
COMMENT ON COLUMN public.password_reset_tokens.used_at IS 'Usage time (NULL if unused)';
COMMENT ON COLUMN public.password_reset_tokens.ip_address IS 'Requester IP address (for security audit)';
COMMENT ON COLUMN public.password_reset_tokens.created_at IS 'Token creation timestamp';


-- =====================================================
-- 2️⃣ Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON public.password_reset_tokens(created_at DESC);

COMMENT ON INDEX idx_password_reset_tokens_token IS 'Fast token lookup (primary use case)';
COMMENT ON INDEX idx_password_reset_tokens_user_id IS 'Query tokens for a specific user';
COMMENT ON INDEX idx_password_reset_tokens_email IS 'Search by email';
COMMENT ON INDEX idx_password_reset_tokens_expires_at IS 'Clean up expired tokens';
COMMENT ON INDEX idx_password_reset_tokens_created_at IS 'Chronological ordering';


-- =====================================================
-- ✅ End of File
-- =====================================================
