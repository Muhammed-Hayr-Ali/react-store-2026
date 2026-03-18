-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens UPDATE
-- File: update_password_reset_tokens.sql
-- Description: تحديث جدول ودوال رموز إعادة تعيين كلمة المرور
-- =====================================================
-- تعليمات:
-- 1. اذهب إلى Supabase Dashboard → SQL Editor
-- 2. انسخ هذا الملف بالكامل
-- 3. الصق واضغط Run
-- =====================================================

-- =====================================================
-- 1. إضافة عمود ip_address
-- =====================================================
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS ip_address INET;

COMMENT ON COLUMN password_reset_tokens.ip_address IS 'عنوان IP لمقدم طلب إعادة التعيين (للتدقيق الأمني)';

-- =====================================================
-- 2. تحديث دالة create_password_reset_token
-- =====================================================
CREATE OR REPLACE FUNCTION create_password_reset_token(
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

  -- 3. (تحسين أمني) حذف أي رموز نشطة سابقة لنفس المستخدم
  -- هذا يمنع وجود أكثر من رمز فعال في نفس الوقت ويقلل من هجمات التخمين
  DELETE FROM password_reset_tokens
  WHERE user_id = p_user_id
    AND (used_at IS NULL AND expires_at > NOW());

  -- 4. إدخال الرمز الجديد
  INSERT INTO password_reset_tokens (user_id, email, token, expires_at, ip_address)
  VALUES (p_user_id, p_email, v_token, v_expires_at, p_ip_address);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_password_reset_token IS 'إنشاء رمز إعادة تعيين كلمة مرور جديد وحذف الرموز القديمة';

-- =====================================================
-- 3. إضافة دالة claim_password_reset_token (جديدة)
-- =====================================================
CREATE OR REPLACE FUNCTION claim_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- UPDATE ... RETURNING تضمن أن العملية ذرية (Atomic)
  -- إذا نجح التحديث، فهذا يعني أن الرمز كان صالحاً وغير مستخدم، وتم استهلاكه الآن
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL
  RETURNING * INTO v_record;

  IF v_record IS NULL THEN
    -- الرمز غير موجود، أو منتهي، أو تم استخدامه مسبقاً
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'رمز غير صحيح أو منتهي أو مُستخدم مسبقاً';
    RETURN;
  END IF;

  -- النجاح: تم استهلاك الرمز
  RETURN QUERY SELECT true, v_record.user_id, v_record.email, 'تم قبول الرمز بنجاح';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION claim_password_reset_token IS 'التحقق الذري من الرمز وتمييزه كمستخدم (يمنع الاستخدام المزدوج)';

-- =====================================================
-- 4. تحديث دالة verify_password_reset_token
-- =====================================================
CREATE OR REPLACE FUNCTION verify_password_reset_token(p_token TEXT)
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
  SELECT * INTO v_record
  FROM password_reset_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TIMESTAMPTZ, 'رمز غير صحيح أو منتهي الصلاحية';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_record.user_id, v_record.email, v_record.expires_at, 'رمز صالح';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_password_reset_token IS 'فحص صلاحية الرمز دون استهلاكه (للعرض فقط)';

-- =====================================================
-- 5. تحديث دالة cleanup_expired_reset_tokens
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'      -- رموز منتهية منذ أكثر من شهر
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days'); -- رموز مستخدمة منذ أكثر من أسبوع

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_reset_tokens IS 'حذف الرموز القديمة والمستخدمة - للاستخدام عبر Cron Job';

-- =====================================================
-- 6. حذف الدالة القديمة use_password_reset_token
-- =====================================================
DROP FUNCTION IF EXISTS use_password_reset_token(TEXT);

-- =====================================================
-- 7. حذف Trigger القديم (لم يعد مطلوباً)
-- =====================================================
DROP TRIGGER IF EXISTS cleanup_reset_tokens_trigger ON password_reset_tokens;
DROP FUNCTION IF EXISTS trigger_cleanup_reset_tokens();

-- =====================================================
-- 8. تنظيف البيانات القديمة (اختياري)
-- =====================================================
-- حذف جميع الرموز المنتهية والمستخدمَة القديمة
DELETE FROM password_reset_tokens
WHERE expires_at < NOW()
   OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');

-- =====================================================
-- 9. التحقق من التحديث
-- =====================================================
-- عرض بنية الجدول المحدثة
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;

-- عرض الدوال المحدثة
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_password_reset_token',
    'claim_password_reset_token',
    'verify_password_reset_token',
    'cleanup_expired_reset_tokens'
  )
ORDER BY routine_name;

-- =====================================================
-- ✅ تم التحديث بنجاح!
-- =====================================================
-- التحديثات المطبقة:
-- 1. ✅ إضافة عمود ip_address
-- 2. ✅ تحديث create_password_reset_token (DELETE بدلاً من UPDATE)
-- 3. ✅ إضافة claim_password_reset_token (جديدة)
-- 4. ✅ تحديث verify_password_reset_token (إضافة expires_at)
-- 5. ✅ حذف use_password_reset_token (قديمة)
-- 6. ✅ حذف Trigger القديم
-- 7. ✅ تنظيف البيانات القديمة
-- =====================================================
-- خطوات ما بعد التحديث:
-- 1. تحقق من أن جميع الدوال تعمل بشكل صحيح
-- 2. اختبر تدفق إعادة تعيين كلمة المرور بالكامل
-- 3. تأكد من أن Cron Job موجود ومجدول
-- =====================================================
