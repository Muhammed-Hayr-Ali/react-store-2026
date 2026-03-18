-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- =====================================================
-- جدول رموز إعادة تعيين كلمة المرور
-- نظام مخصص لاستعادة كلمة المرور المفقودة
-- =====================================================

-- 1. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT token_not_expired CHECK (expires_at > NOW()),
  CONSTRAINT token_format_check CHECK (token ~ '^[A-Za-z0-9]{64}$')
);

-- 2. INDEXES (فهارس للبحث السريع)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON password_reset_tokens(created_at DESC);

-- 3. COMMENTS (تعليقات توضيحية)
COMMENT ON TABLE password_reset_tokens IS 'رموز إعادة تعيين كلمة المرور - صالحة لمدة 60 دقيقة';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'معرف المستخدم من auth.users';
COMMENT ON COLUMN password_reset_tokens.email IS 'البريد الإلكتروني للمستخدم';
COMMENT ON COLUMN password_reset_tokens.token IS 'رمز عشوائي 64 حرف لإعادة التعيين';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'وقت انتهاء صلاحية الرمز';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'وقت استخدام الرمز (NULL إذا لم يُستخدم)';

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- سياسة: لا أحد يمكنه القراءة إلا النظام (عبر Server Actions)
DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false); -- منع القراءة العامة تماماً

-- سياسة: فقط Service Role يمكنه الإدراج والحذف
DROP POLICY IF EXISTS "password_reset_tokens_service_write" ON password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_write"
  ON password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. HELPER FUNCTIONS (دوال مساعدة)

-- دالة لإنشاء رمز إعادة تعيين كلمة مرور
CREATE OR REPLACE FUNCTION create_password_reset_token(
  p_user_id UUID,
  p_email TEXT,
  p_expires_in_minutes INTEGER DEFAULT 60
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- توليد رمز عشوائي 64 حرف
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- حساب وقت الانتهاء
  v_expires_at := NOW() + (p_expires_in_minutes || ' minutes')::INTERVAL;
  
  -- إدخال الرمز في الجدول
  INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
  VALUES (p_user_id, p_email, v_token, v_expires_at);
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_password_reset_token IS 'إنشاء رمز إعادة تعيين كلمة مرور جديد';

-- دالة للتحقق من رمز إعادة التعيين
CREATE OR REPLACE FUNCTION verify_password_reset_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  user_id UUID,
  email TEXT,
  message TEXT
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- البحث عن الرمز
  SELECT * INTO v_record
  FROM password_reset_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;
  
  -- التحقق من وجود الرمز
  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'رمز غير صحيح أو منتهي الصلاحية';
    RETURN;
  END IF;
  
  -- الرمز صالح
  RETURN QUERY SELECT true, v_record.user_id, v_record.email, 'رمز صالح';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_password_reset_token IS 'التحقق من صحة رمز إعادة التعيين';

-- دالة لاستخدام الرمز (تمييزه كمستخدم)
CREATE OR REPLACE FUNCTION use_password_reset_token(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE password_reset_tokens
  SET used_at = NOW()
  WHERE token = p_token
    AND used_at IS NULL;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION use_password_reset_token IS 'تمييز الرمز كمستخدم بعد إعادة التعيين الناجحة';

-- دالة لتنظيف الرموز القديمة
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_reset_tokens IS 'حذف الرموز القديمة لتنظيف قاعدة البيانات';

-- 6. TRIGGER لتنظيف الرموز القديمة تلقائياً (اختياري)
-- يمكن تشغيله يدوياً أو عبر Cron Job
CREATE OR REPLACE FUNCTION trigger_cleanup_reset_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- تنظيف الرموز القديمة بعد كل إدخال جديد
  PERFORM cleanup_expired_reset_tokens();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_reset_tokens_trigger ON password_reset_tokens;
CREATE TRIGGER cleanup_reset_tokens_trigger
  AFTER INSERT ON password_reset_tokens
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_reset_tokens();

-- =====================================================
-- استعلامات مفيدة
-- =====================================================

-- إنشاء رمز جديد:
-- SELECT create_password_reset_token('user-uuid', 'user@example.com', 60);

-- التحقق من رمز:
-- SELECT * FROM verify_password_reset_token('your-token-here');

-- استخدام رمز:
-- SELECT use_password_reset_token('your-token-here');

-- تنظيف الرموز القديمة:
-- SELECT cleanup_expired_reset_tokens();

-- عرض جميع الرموز النشطة:
-- SELECT id, email, expires_at, 
--        CASE 
--          WHEN expires_at > NOW() THEN 'active'
--          ELSE 'expired'
--        END as status
-- FROM password_reset_tokens
-- WHERE used_at IS NULL
-- ORDER BY created_at DESC;

-- =====================================================
-- ملاحظات هامة
-- =====================================================
-- 1. الرموز صالحة لمدة 60 دقيقة افتراضياً
-- 2. الرمز يُستخدم لمرة واحدة فقط
-- 3. الرموز القديمة تُحذف تلقائياً بعد 30 يوم
-- 4. الرموز المستخدمة تُحفظ لمدة 7 أيام للسجلات
-- 5. RLS يمنع الوصول العام تماماً
-- 6. جميع العمليات تتم عبر Server Actions بـ service_role

-- =====================================================
-- الأمان
-- =====================================================
-- - الرموز مشفرة (64 حرف عشوائي)
-- - انتهاء صلاحية تلقائي
-- - استخدام لمرة واحدة فقط
-- - لا يمكن الوصول إليها من العميل
-- - مسجلة للمراجعة الأمنية
