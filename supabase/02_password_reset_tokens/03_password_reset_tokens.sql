-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- File: 03_password_reset_tokens.sql
-- Dependencies: None (Standalone)
-- Description: نظام آمن لإعادة تعيين كلمة المرور
-- =====================================================

-- 1. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET, -- ✅ جديد: لتدقيق الأمان وتتبع الطلبات
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ✅ تم إزالة قيد NOW() لتجنب مشاكل التقييم في PostgreSQL
  -- ✅ التحقق من صلاحية الرمز يتم عبر الدوال ووقت الاستعلام
  CONSTRAINT token_format_check CHECK (token ~ '^[A-Za-z0-9]{64}$')
);

-- 2. INDEXES (فهارس للبحث السريع والأداء)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON public.password_reset_tokens(created_at DESC);

-- 3. COMMENTS (تعليقات توضيحية)
COMMENT ON TABLE public.password_reset_tokens IS 'رموز إعادة تعيين كلمة المرور - صالحة لمدة 60 دقيقة';
COMMENT ON COLUMN public.password_reset_tokens.ip_address IS 'عنوان IP لمقدم طلب إعادة التعيين (للتدقيق الأمني)';

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- سياسة: منع القراءة العامة تماماً (حتى للمستخدمين المصادقين)
DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);

-- سياسة: السماح للخدمة الخلفية (Service Role) بالوصول الكامل
-- ملاحظة: العمليات تتم عبر Server Actions باستخدام خدمة service_role
DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. HELPER FUNCTIONS (دوال مساعدة آمنة)

-- دالة 1: إنشاء رمز إعادة تعيين كلمة مرور
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

-- دالة 2: التحقق والاستخدام في خطوة واحدة (Atomic Claim)
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
  -- ✅ استخدام UPDATE ... RETURNING مع اسم الجدول بشكل صريح
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

-- دالة 3: التحقق فقط (لأغراض العرض أو الـ Preview)
-- ⚠️ تحذير: لا تستخدم هذه الدالة كخطوة وحيدة للأمان، يجب استخدام claim بعدها مباشرة
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
      false::BOOLEAN, 
      NULL::UUID, 
      NULL::TEXT, 
      NULL::TIMESTAMPTZ, 
      'رمز غير صحيح أو منتهي الصلاحية'::TEXT;
    RETURN;
  END IF;

  -- ✅ استخدام أسماء الأعمدة من الجدول بشكل صريح
  RETURN QUERY SELECT 
    true::BOOLEAN, 
    v_record.user_id, 
    v_record.email, 
    v_record.expires_at, 
    'رمز صالح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_password_reset_token IS 'فحص صلاحية الرمز دون استهلاكه (للعرض فقط)';

-- دالة 4: تنظيف الرموز القديمة (للاستخدام الخارجي - Cron Job)
-- ✅ تم تصميم هذه الدالة ليتم استدعاؤها يدوياً أو عبر جدولة خارجية
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'      -- رموز منتهية منذ أكثر من شهر
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days'); -- رموز مستخدمة منذ أكثر من أسبوع
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 'حذف الرموز القديمة والمستخدمة - للاستخدام عبر Cron Job';

-- =====================================================
-- 📋 أمثلة الاستخدام (للمطورين)
-- =====================================================

-- 1. إنشاء رمز (عند طلب المستخدم):
-- SELECT create_password_reset_token('user-uuid', 'user@example.com', 60, '192.168.1.5'::INET);

-- 2. عند إدخال المستخدم للرمز (الخطوة الآمنة):
-- SELECT * FROM claim_password_reset_token('token-from-user');
-- إذا كانت is_valid = true -> اعرض صفحة تغيير كلمة المرور

-- 3. التنظيف الدوري (في الـ Backend Route):
-- SELECT cleanup_expired_reset_tokens();

-- =====================================================
-- 🔐 ملاحظات الأمان
-- =====================================================
-- 1. الرموز صالحة لمدة 60 دقيقة افتراضياً.
-- 2. الدالة claim_password_reset_token تمنع استخدام الرمز مرتين (Atomic).
-- 3. يتم إبطال الرموز القديمة للمستخدم تلقائياً عند إنشاء رمز جديد.
-- 4. سياسات RLS تمنع أي وصول من المتصفح (Client)، العمليات تتم فقط عبر الخدمة الخلفية.
-- 5. يجب جدولة دالة cleanup_expired_reset_tokens لتعمل يومياً للحفاظ على نظافة القاعدة.