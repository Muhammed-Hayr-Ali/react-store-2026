-- ملف إنشاء الدوال

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Functions
-- File: 01_password_reset_functions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: دوال إدارة رموز إعادة تعيين كلمة المرور
-- Dependencies: public.password_reset_tokens
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. دالة إنشاء رمز إعادة التعيين
-- 2. دالة التحقق والاستخدام الذري (Atomic Claim)
-- 3. دالة التحقق فقط (للعرض)
-- 4. دالة تنظيف الرموز القديمة
-- =====================================================


-- =====================================================
-- 1️⃣ دالة إنشاء رمز إعادة التعيين
-- =====================================================
-- تقوم تلقائياً بحذف أي رموز سابقة لنفس المستخدم لمنع التراكم

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
  -- 1. توليد رمز عشوائي آمن (64 حرف)
  v_token := encode(gen_random_bytes(32), 'hex');

  -- 2. حساب وقت الانتهاء
  v_expires_at := NOW() + (p_expires_in_minutes || ' minutes')::INTERVAL;

  -- 3. حذف أي رموز نشطة سابقة لنفس المستخدم (أمان)
  DELETE FROM public.password_reset_tokens
  WHERE user_id = p_user_id
    AND used_at IS NULL AND expires_at > NOW();

  -- 4. إدخال الرمز الجديد
  INSERT INTO public.password_reset_tokens (user_id, email, token, expires_at, ip_address)
  VALUES (p_user_id, p_email, v_token, v_expires_at, p_ip_address);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_password_reset_token IS 'إنشاء رمز إعادة تعيين كلمة مرور جديد وحذف الرموز القديمة';


-- =====================================================
-- 2️⃣ دالة التحقق والاستخدام الذري (Atomic Claim)
-- =====================================================
-- ✅ هذه الدالة هي الأكثر أماناً: تتحقق من الصلاحية وتعلم الرمز كمستخدم في نفس اللحظة
-- مما يمنع استخدام الرمز مرتين (Race Condition)

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
      'رمز غير صحيح أو منتهي أو مُستخدم مسبقاً'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::BOOLEAN,
    v_record.user_id,
    v_record.email,
    'تم قبول الرمز بنجاح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.claim_password_reset_token IS 'التحقق الذري من الرمز وتمييزه كمستخدم (يمنع الاستخدام المزدوج)';


-- =====================================================
-- 3️⃣ دالة التحقق فقط (للعرض)
-- =====================================================
-- ⚠️ تحذير: لا تستخدم هذه الدالة كخطوة وحيدة للأمان

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
      'رمز غير صحيح أو منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::BOOLEAN,
    v_record.user_id,
    v_record.email,
    v_record.expires_at,
    'رمز صالح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'فحص صلاحية الرمز دون استهلاكه (للعرض فقط)';


-- =====================================================
-- 4️⃣ دالة تنظيف الرموز القديمة
-- =====================================================
-- ✅ للاستخدام الخارجي - Cron Job

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

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 'حذف الرموز القديمة والمستخدمة - للاستخدام عبر Cron Job';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================