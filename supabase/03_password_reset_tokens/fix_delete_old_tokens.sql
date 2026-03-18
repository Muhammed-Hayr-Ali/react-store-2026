-- =====================================================
-- Fix: Delete old password reset tokens instead of expiring them
-- File: fix_password_reset_tokens.sql
-- =====================================================

-- تحديث الدالة create_password_reset_token لحذف الرموز القديمة بدلاً من إنهاؤها
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

  -- 3. (تحسين أمني) حذف أي رموز نشطة سابقة لنفس المستخدم
  -- هذا يمنع وجود أكثر من رمز فعال في نفس الوقت ويقلل من هجمات التخمين
  DELETE FROM public.password_reset_tokens
  WHERE user_id = p_user_id
    AND (used_at IS NULL AND expires_at > NOW());

  -- 4. إدخال الرمز الجديد
  INSERT INTO public.password_reset_tokens (user_id, email, token, expires_at, ip_address)
  VALUES (p_user_id, p_email, v_token, v_expires_at, p_ip_address);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_password_reset_token IS 'إنشاء رمز إعادة تعيين كلمة مرور جديد وحذف الرموز القديمة';

-- =====================================================
-- ملاحظات
-- =====================================================
-- 1. الآن عند طلب رمز جديد، يتم حذف جميع الرموز النشطة القديمة
-- 2. هذا يمنع تراكم الرموز ويحسن الأداء
-- 3. الرمز الوحيد الصالح هو آخر رمز تم إنشاؤه
-- =====================================================
