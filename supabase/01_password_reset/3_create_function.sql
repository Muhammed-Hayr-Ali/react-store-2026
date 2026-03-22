-- Functions Creation File

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Functions
-- File: 01_password_reset_functions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Password reset tokens management functions
-- Dependencies: public.password_reset_tokens
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Create reset token function
-- 2. Atomic claim function
-- 3. Verify only function (for display)
-- 4. Clean up old tokens function
-- =====================================================


-- =====================================================
-- 1️⃣ Create Reset Token Function
-- =====================================================
-- Automatically deletes any previous tokens for the same user to prevent accumulation

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_password_reset_token IS 'Create a new password reset token and delete old tokens';


-- =====================================================
-- 2️⃣ Atomic Claim Function
-- =====================================================
-- ✅ This function is the most secure: verifies validity and marks token as used atomically
-- preventing token reuse (Race Condition)

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.claim_password_reset_token IS 'Atomic token verification and usage marking (prevents double use)';


-- =====================================================
-- 3️⃣ Verify Only Function (For Display)
-- =====================================================
-- ⚠️ Warning: Do not use this function as a standalone security step

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'Check token validity without consuming it (for display only)';


-- =====================================================
-- 4️⃣ Clean Up Old Tokens Function
-- =====================================================
-- ✅ For external use - Cron Job

CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 'Delete old and used tokens - for use via Cron Job';


-- =====================================================
-- ✅ End of File
-- =====================================================
