-- =====================================================
-- 🔐 Password Reset System — نظام استعادة كلمة المرور
-- =====================================================
-- ⚠️ يعتمد على: auth_password_reset (معرّف في 001_schema.sql)
-- =====================================================
-- 📋 المحتويات:
--    1. إنشاء رمز جديد
--    2. التحقق الذكي + استهلاك (Atomic Claim)
--    3. التحقق فقط (للعرض)
--    4. تنظيف الرموز المنتهية
-- =====================================================

-- =====================================================
-- 1️⃣ دالة: إنشاء رمز استعادة كلمة المرور
-- =====================================================
-- 🎯 تُنشئ رمز جديد + تبطل الرموز القديمة لنفس المستخدم
-- 📝 ترجع: الرمز النصي (64 حرف)

CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  p_profile_id uuid,
  p_email text,
  p_expires_in_minutes integer DEFAULT 60,
  p_ip_address text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
  v_expires_at timestamptz;
BEGIN
  -- التحقق من صحة البريد
  IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- التحقق من مدة الصلاحية
  IF p_expires_in_minutes < 5 OR p_expires_in_minutes > 1440 THEN
    RAISE EXCEPTION 'Expiration must be between 5 and 1440 minutes';
  END IF;

  -- إنشاء رمز عشوائي (64 حرف)
  v_token := encode(gen_random_bytes(32), 'hex');

  -- حساب وقت الانتهاء
  v_expires_at := NOW() + (p_expires_in_minutes || ' minutes')::interval;

  -- إلغاء الرموز القديمة لنفس المستخدم
  UPDATE public.auth_password_reset
  SET is_revoked = true
  WHERE profile_id = p_profile_id
    AND is_revoked = false
    AND used_at IS NULL
    AND expires_at > NOW();

  -- إدراج الرمز الجديد
  INSERT INTO public.auth_password_reset (
    profile_id, email, token, expires_at, ip_address
  ) VALUES (
    p_profile_id, p_email, v_token, v_expires_at, p_ip_address
  );

  RETURN v_token;
END;
$$;

COMMENT ON FUNCTION public.create_password_reset_token IS 'إنشاء رمز استعادة كلمة المرور + إبطال الرموز القديمة';

-- =====================================================
-- 2️⃣ دالة: التحقق الذكي + استهلاك (Atomic Claim)
-- =====================================================
-- 🔒 العملية الأكثر أماناً — تمنع الاستخدام المزدوج
-- 📝 ترجع: جدول (is_valid, profile_id, email, message)

CREATE OR REPLACE FUNCTION public.claim_password_reset_token(
  p_token text
)
RETURNS TABLE (
  is_valid boolean,
  profile_id uuid,
  email text,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record public.auth_password_reset%ROWTYPE;
BEGIN
  -- التحقق من صيغة الرمز (64 حرف)
  IF p_token !~ '^[A-Za-z0-9]{64}$' THEN
    RETURN QUERY SELECT
      false::boolean,
      NULL::uuid,
      NULL::text,
      'Invalid token format'::text;
    RETURN;
  END IF;

  -- UPDATE ذري: التحقق + وضع علامة "مستخدم" في عملية واحدة
  UPDATE public.auth_password_reset prt
  SET used_at = NOW()
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL
    AND prt.is_revoked = false
  RETURNING * INTO v_record;

  -- لم يتم العثور على رمز صالح
  IF v_record.id IS NULL THEN
    RETURN QUERY SELECT
      false::boolean,
      NULL::uuid,
      NULL::text,
      'Invalid, expired, revoked, or already used token'::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::boolean,
    v_record.profile_id,
    v_record.email,
    'Token claimed successfully'::text;
END;
$$;

COMMENT ON FUNCTION public.claim_password_reset_token IS 'التحقق الذكي من الرمز + استهلاكه (يمنع الاستخدام المزدوج)';

-- =====================================================
-- 3️⃣ دالة: التحقق فقط (للعرض — ليست آمنة للاستخدام)
-- =====================================================
-- ⚠️ للاستخدام في واجهة المستخدم فقط — لا تستهلك الرمز

CREATE OR REPLACE FUNCTION public.verify_password_reset_token(
  p_token text
)
RETURNS TABLE (
  is_valid boolean,
  profile_id uuid,
  email text,
  expires_at timestamptz,
  message text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_record public.auth_password_reset%ROWTYPE;
BEGIN
  -- التحقق من صيغة الرمز
  IF p_token !~ '^[A-Za-z0-9]{64}$' THEN
    RETURN QUERY SELECT
      false::boolean,
      NULL::uuid,
      NULL::text,
      NULL::timestamptz,
      'Invalid token format'::text;
    RETURN;
  END IF;

  SELECT prt.* INTO v_record
  FROM public.auth_password_reset prt
  WHERE prt.token = p_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL
    AND prt.is_revoked = false;

  IF v_record.id IS NULL THEN
    RETURN QUERY SELECT
      false::boolean,
      NULL::uuid,
      NULL::text,
      NULL::timestamptz,
      'Invalid, expired, revoked, or already used token'::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true::boolean,
    v_record.profile_id,
    v_record.email,
    v_record.expires_at,
    'Valid token'::text;
END;
$$;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'التحقق من الرمز فقط (للعرض — لا تستهلك الرمز)';

-- =====================================================
-- 4️⃣ دالة: تنظيف الرموز المنتهية (لـ Cron Job)
-- =====================================================
-- 🗑️ تحذف الرموز المنتهية (30+ يوم) والمستهلكة (7+ يوم)
-- 📝 ترجع: عدد الصفوف المحذوفة

CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens(
  p_batch_size integer DEFAULT 1000
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.auth_password_reset
  WHERE id IN (
    SELECT id FROM public.auth_password_reset
    WHERE expires_at < NOW() - interval '30 days'
       OR (used_at IS NOT NULL AND used_at < NOW() - interval '7 days')
    LIMIT p_batch_size
  );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 'حذف الرموز المنتهية والمستهلكة — لاستخدامها عبر Cron Job';

-- =====================================================
-- ✅ Verification
-- =====================================================

SELECT
  '✅ Password reset functions created!' AS status,
  (SELECT COUNT(*) FROM information_schema.routines
   WHERE routine_schema = 'public'
     AND routine_name IN (
       'create_password_reset_token',
       'claim_password_reset_token',
       'verify_password_reset_token',
       'cleanup_expired_reset_tokens'
     )
  ) AS functions_count;

-- النتيجة المتوقعة: 4 دوال
