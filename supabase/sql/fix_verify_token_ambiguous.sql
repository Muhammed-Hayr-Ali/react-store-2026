-- =====================================================
-- Fix: Column reference "expires_at" is ambiguous
-- File: fix_verify_password_reset_token.sql
-- =====================================================
-- تعليمات:
-- 1. اذهب إلى Supabase Dashboard → SQL Editor
-- 2. انسخ هذا الملف بالكامل
-- 3. الصق واضغط Run
-- =====================================================

-- =====================================================
-- إصلاح دالة verify_password_reset_token
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
  -- ✅ استخدام اسم الجدول بشكل صريح لتجنب التضارب
  SELECT prt.* INTO v_record
  FROM public.password_reset_tokens prt
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;

  IF v_record IS NULL THEN
    -- ✅ تحديد القيم بشكل صريح
    RETURN QUERY SELECT 
      false AS is_valid, 
      NULL::UUID AS user_id, 
      NULL::TEXT AS email, 
      NULL::TIMESTAMPTZ AS expires_at, 
      'رمز غير صحيح أو منتهي الصلاحية' AS message;
    RETURN;
  END IF;

  -- ✅ استخدام أسماء الأعمدة من الجدول بشكل صريح
  RETURN QUERY SELECT 
    true AS is_valid, 
    v_record.user_id AS user_id, 
    v_record.email AS email, 
    v_record.expires_at AS expires_at, 
    'رمز صالح' AS message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'فحص صلاحية الرمز دون استهلاكه (للعرض فقط) - تم إصلاح التضارب';

-- =====================================================
-- إصلاح دالة claim_password_reset_token (للتأكد)
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
  -- ✅ استخدام UPDATE ... RETURNING مع اسم الجدول بشكل صريح
  UPDATE public.password_reset_tokens prt
  SET used_at = NOW()
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL
  RETURNING * INTO v_record;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT 
      false AS is_valid, 
      NULL::UUID AS user_id, 
      NULL::TEXT AS email, 
      'رمز غير صحيح أو منتهي أو مُستخدم مسبقاً' AS message;
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    true AS is_valid, 
    v_record.user_id AS user_id, 
    v_record.email AS email, 
    'تم قبول الرمز بنجاح' AS message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.claim_password_reset_token IS 'التحقق الذري من الرمز وتمييزه كمستخدم (يمنع الاستخدام المزدوج) - تم الإصلاح';

-- =====================================================
-- التحقق من الإصلاح
-- =====================================================
-- عرض معلومات الدوال
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'verify_password_reset_token',
    'claim_password_reset_token'
  )
ORDER BY routine_name;

-- =====================================================
-- ✅ تم الإصلاح بنجاح!
-- =====================================================
-- التغييرات:
-- 1. ✅ استخدام اسم الجدول بشكل صريح (prt.*)
-- 2. ✅ تحديد قيم الإرجاع بشكل صريح
-- 3. ✅ تجنب التضارب بين المتغيرات والأعمدة
-- =====================================================
