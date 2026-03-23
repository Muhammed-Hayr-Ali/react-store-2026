-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- File: 01_password_reset_tokens.sql
-- Version: 2.0 (Corrected)
-- Date: 2026-03-22
-- Description: Secure password reset system
-- Dependencies: auth.users (Supabase Auth)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create password reset tokens table
-- 3. Indexes
-- 4. Row Level Security (RLS)
-- 5. Functions (4 functions)
-- 6. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

-- Drop functions first (depend on table)
DROP FUNCTION IF EXISTS public.create_password_reset_token(UUID, TEXT, INTEGER, INET) CASCADE;
DROP FUNCTION IF EXISTS public.claim_password_reset_token(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.verify_password_reset_token(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_reset_tokens() CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;

-- Drop indexes
DROP INDEX IF EXISTS idx_password_reset_tokens_token;
DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;
DROP INDEX IF EXISTS idx_password_reset_tokens_email;
DROP INDEX IF EXISTS idx_password_reset_tokens_expires_at;
DROP INDEX IF EXISTS idx_password_reset_tokens_created_at;

-- Drop table
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;


-- =====================================================
-- 2️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.password_reset_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  -- ✅ Added: CHECK constraint for 64 character token format
  token        TEXT UNIQUE NOT NULL CHECK (token ~ '^[A-Za-z0-9]{64}$'),
  expires_at   TIMESTAMPTZ NOT NULL,
  used_at      TIMESTAMPTZ,
  ip_address   INET,
  created_at   TIMESTAMPTZ DEFAULT NOW()
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
-- 3️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_created_at ON public.password_reset_tokens(created_at DESC);

COMMENT ON INDEX idx_password_reset_tokens_token IS 'Fast token lookup (primary use case)';
COMMENT ON INDEX idx_password_reset_tokens_user_id IS 'Query tokens for a specific user';
COMMENT ON INDEX idx_password_reset_tokens_email IS 'Search by email';
COMMENT ON INDEX idx_password_reset_tokens_expires_at IS 'Clean up expired tokens';
COMMENT ON INDEX idx_password_reset_tokens_created_at IS 'Chronological ordering';


-- =====================================================
-- 4️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Block ALL public reads (security)
-- =====================================================
DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);

COMMENT ON POLICY "password_reset_tokens_no_public_read" ON public.password_reset_tokens 
  IS 'Prevent any public read - tokens are completely secret';

-- =====================================================
-- Policy 2: Backend service full access
-- =====================================================
DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "password_reset_tokens_service_full_access" ON public.password_reset_tokens 
  IS 'Only backend service has full access';

-- =====================================================
-- ⚠️ IMPORTANT: Functions with SECURITY DEFINER bypass RLS
-- This is intentional - functions are the only way to access tokens
-- =====================================================


-- =====================================================
-- 5️⃣ FUNCTIONS
-- =====================================================

-- =====================================================
-- Function 1: Create Reset Token
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  p_user_id UUID,
  p_email TEXT,
  p_expires_in_minutes INTEGER DEFAULT 60,
  p_ip_address INET DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- ✅ Input validation
  IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  IF p_expires_in_minutes < 5 OR p_expires_in_minutes > 1440 THEN
    RAISE EXCEPTION 'Expiration must be between 5 and 1440 minutes';
  END IF;

  -- 1. Generate secure random token (64 characters)
  v_token := encode(gen_random_bytes(32), 'hex');

  -- 2. Calculate expiration time
  v_expires_at := NOW() + (p_expires_in_minutes || ' minutes')::INTERVAL;

  -- 3. Delete any previous active tokens for the same user (security)
  DELETE FROM public.password_reset_tokens
  WHERE user_id = p_user_id
    AND used_at IS NULL AND expires_at > NOW();

  -- 4. Insert new token
  INSERT INTO public.password_reset_tokens (user_id, email, token, expires_at, ip_address)
  VALUES (p_user_id, p_email, v_token, v_expires_at, p_ip_address);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.create_password_reset_token IS 'Create a new password reset token and delete old tokens';


-- =====================================================
-- Function 2: Atomic Claim Function (Most Secure)
-- =====================================================
CREATE OR REPLACE FUNCTION public.claim_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- ✅ Token format validation
  IF p_token !~ '^[A-Za-z0-9]{64}$' THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      'Invalid token format'::TEXT;
    RETURN;
  END IF;

  -- Atomic UPDATE: verify + mark as used in one operation
  -- This prevents race conditions and double-use
  UPDATE public.password_reset_tokens prt
  SET used_at = NOW()
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL
  RETURNING * INTO v_record;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      'Invalid, expired, or previously used token'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::BOOLEAN,
    v_record.user_id,
    v_record.email,
    'Token accepted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.claim_password_reset_token IS 'Atomic token verification and usage marking (prevents double use)';


-- =====================================================
-- Function 3: Verify Only (For Display - NOT for Security)
-- =====================================================
CREATE OR REPLACE FUNCTION public.verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- ✅ Token format validation
  IF p_token !~ '^[A-Za-z0-9]{64}$' THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'Invalid token format'::TEXT;
    RETURN;
  END IF;

  SELECT prt.* INTO v_record
  FROM public.password_reset_tokens prt
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      'Invalid or expired token'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::BOOLEAN,
    v_record.user_id,
    v_record.email,
    v_record.expires_at,
    'Valid token'::TEXT;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'Check token validity without consuming it (for display only)';


-- =====================================================
-- Function 4: Clean Up Old Tokens (Cron Job)
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens(p_batch_size INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Delete in batches to avoid long locks
  DELETE FROM public.password_reset_tokens
  WHERE id IN (
    SELECT id FROM public.password_reset_tokens
    WHERE expires_at < NOW() - INTERVAL '30 days'
       OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days')
    LIMIT p_batch_size
  );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 'Delete old and used tokens - for use via Cron Job';


-- =====================================================
-- 6️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Password reset tokens setup complete!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'password_reset_tokens') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'password_reset_tokens') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'password_reset_tokens') AS policies,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE 'password_reset%') AS functions;
