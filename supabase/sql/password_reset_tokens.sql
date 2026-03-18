-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- File: password_reset_tokens.sql
-- Dependencies: None (Standalone)
-- Description: نظام آمن لإعادة تعيين كلمة المرور
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
  ip_address INET, -- عنوان IP لمقدم الطلب (للتدقيق الأمني)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- ✅ التحقق من أن الرمز يتكون من 64 حرف أبجدي رقمي
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
COMMENT ON COLUMN password_reset_tokens.ip_address IS 'عنوان IP لمقدم طلب إعادة التعيين (للتدقيق الأمني)';

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

-- 5. HELPER FUNCTIONS (دوال مساعدة آمنة)

-- دالة 1: إنشاء رمز إعادة تعيين كلمة مرور
-- تقوم تلقائياً بحذف أي رموز سابقة لنفس المستخدم لمنع التراكم
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

-- دالة 2: التحقق والاستخدام في خطوة واحدة (Atomic Claim)
-- ✅ هذه الدالة هي الأكثر أماناً: تتحقق من الصلاحية وتعلم الرمز كمستخدم في نفس اللحظة
-- مما يمنع استخدام الرمز مرتين (Race Condition)
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

-- دالة 3: التحقق فقط (لأغراض العرض أو الـ Preview)
-- ⚠️ تحذير: لا تستخدم هذه الدالة كخطوة وحيدة للأمان، يجب استخدام claim بعدها مباشرة
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

-- دالة 4: تنظيف الرموز القديمة (للاستخدام الخارجي - Cron Job)
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
-- أمثلة الاستخدام (للمطورين)
-- =====================================================

-- 1. إنشاء رمز (عند طلب المستخدم):
-- SELECT create_password_reset_token('user-uuid', 'user@example.com', 60, '192.168.1.5'::INET);

-- 2. عند إدخال المستخدم للرمز (الخطوة الآمنة):
-- SELECT * FROM claim_password_reset_token('token-from-user');
-- إذا كانت is_valid = true -> اعرض صفحة تغيير كلمة المرور

-- 3. التحقق للعرض فقط (ليس للأمان):
-- SELECT * FROM verify_password_reset_token('token-from-user');

-- 4. التنظيف الدوري (في الـ Backend Route):
-- SELECT cleanup_expired_reset_tokens();

-- =====================================================
-- ملاحظات هامة
-- =====================================================
-- 1. الرموز صالحة لمدة 60 دقيقة افتراضياً.
-- 2. الدالة claim_password_reset_token تمنع استخدام الرمز مرتين (Atomic).
-- 3. يتم إبطال الرموز القديمة للمستخدم تلقائياً عند إنشاء رمز جديد.
-- 4. سياسات RLS تمنع أي وصول من المتصفح (Client)، العمليات تتم فقط عبر الخدمة الخلفية.
-- 5. يجب جدولة دالة cleanup_expired_reset_tokens لتعمل يومياً للحفاظ على نظافة القاعدة.
-- 6. يتم تخزين عنوان IP لكل طلب للتدقيق الأمني.

-- =====================================================
-- الأمان
-- =====================================================
-- - الرموز مشفرة (64 حرف عشوائي)
-- - انتهاء صلاحية تلقائي (60 دقيقة)
-- - استخدام لمرة واحدة فقط (claim_password_reset_token)
-- - لا يمكن الوصول إليها من العميل (RLS)
-- - مسجلة للمراجعة الأمنية (ip_address, used_at)
-- - حذف الرموز القديمة تلقائياً (Cron Job)
