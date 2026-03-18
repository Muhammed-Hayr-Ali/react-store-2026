-- =====================================================
-- Marketna E-Commerce - Password Reset System
-- File: password_reset_system.sql
-- Version: 2.0
-- Description: نظام متكامل وآمن لإعادة تعيين كلمة المرور
-- =====================================================
-- المحتويات:
-- 1. جدول رموز إعادة التعيين
-- 2. سياسات الأمان (RLS)
-- 3. الدوال المساعدة
-- 4. أمثلة الاستخدام
-- 5. التوثيق الكامل
-- =====================================================

-- =====================================================
-- 1. جدول رموز إعادة تعيين كلمة المرور
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  -- المعرف الفريد
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ربط المستخدم
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- الرمز السري
  token TEXT UNIQUE NOT NULL,
  
  -- الصلاحية والاستخدام
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- التدقيق الأمني
  ip_address INET,
  
  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- قيود التحقق
  CONSTRAINT token_format_check CHECK (token ~ '^[A-Za-z0-9]{64}$')
);

-- تعليق على الجدول
COMMENT ON TABLE public.password_reset_tokens IS 
  'نظام رموز إعادة تعيين كلمة المرور - صالحة لمدة 60 دقيقة، استخدام لمرة واحدة';

-- تعليقات على الأعمدة
COMMENT ON COLUMN public.password_reset_tokens.user_id IS 'معرف المستخدم من auth.users';
COMMENT ON COLUMN public.password_reset_tokens.email IS 'البريد الإلكتروني للمستخدم';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'رمز عشوائي 64 حرف (hex)';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'وقت انتهاء الصلاحية';
COMMENT ON COLUMN public.password_reset_tokens.used_at IS 'وقت الاستخدام (NULL = لم يُستخدم)';
COMMENT ON COLUMN public.password_reset_tokens.ip_address IS 'عنوان IP للتدقيق الأمني';

-- =====================================================
-- 2. الفهارس (Indexes)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
  ON public.password_reset_tokens(token);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
  ON public.password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email 
  ON public.password_reset_tokens(email);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
  ON public.password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at 
  ON public.password_reset_tokens(created_at DESC);

-- =====================================================
-- 3. سياسات الأمان (Row Level Security)
-- =====================================================
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- منع القراءة العامة تماماً
DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);

-- السماح لـ Service Role بالوصول الكامل (للـ Cron Job و Server Actions)
DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. الدوال المساعدة (Helper Functions)
-- =====================================================

-- -----------------------------------------------------
-- دالة 1: إنشاء رمز جديد (مع حذف الرموز القديمة)
-- -----------------------------------------------------
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

  -- 3. (أمني) حذف أي رموز نشطة سابقة لنفس المستخدم
  DELETE FROM public.password_reset_tokens
  WHERE user_id = p_user_id
    AND (used_at IS NULL AND expires_at > NOW());

  -- 4. إدخال الرمز الجديد
  INSERT INTO public.password_reset_tokens (user_id, email, token, expires_at, ip_address)
  VALUES (p_user_id, p_email, v_token, v_expires_at, p_ip_address);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_password_reset_token IS 
  'إنشاء رمز إعادة تعيين كلمة مرور جديد وحذف الرموز القديمة';

-- -----------------------------------------------------
-- دالة 2: التحقق الذري واستهلاك الرمز (Atomic Claim)
-- -----------------------------------------------------
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
  -- UPDATE ... RETURNING تضمن عملية ذرية (تمنع الاستخدام المزدوج)
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

COMMENT ON FUNCTION public.claim_password_reset_token IS 
  'التحقق الذري من الرمز واستهلاكه (يمنع الاستخدام المزدوج) - استخدم هذه الدالة لإعادة التعيين';

-- -----------------------------------------------------
-- دالة 3: التحقق فقط (للعرض - ليس للأمان)
-- -----------------------------------------------------
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

COMMENT ON FUNCTION public.verify_password_reset_token IS 
  'فحص صلاحية الرمز دون استهلاكه (للعرض فقط) - ⚠️ لا تستخدم للأمان';

-- -----------------------------------------------------
-- دالة 4: تنظيف الرموز القديمة (Cron Job)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days'      -- رموز منتهية منذ >30 يوم
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days'); -- رموز مستخدمة منذ >7 أيام

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_reset_tokens IS 
  'حذف الرموز القديمة - يُستدعى يومياً عبر Cron Job';

-- =====================================================
-- 5. أمثلة الاستخدام (Usage Examples)
-- =====================================================

/*
-- مثال 1: إنشاء رمز جديد
SELECT create_password_reset_token(
  'user-uuid-here',
  'user@example.com',
  60,
  '192.168.1.100'::INET
);

-- مثال 2: التحقق من الرمز (للعرض فقط)
SELECT * FROM verify_password_reset_token('token-here');

-- مثال 3: استهلاك الرمز (للإعادة تعيين الفعلية)
SELECT * FROM claim_password_reset_token('token-here');

-- مثال 4: تنظيف الرموز القديمة
SELECT cleanup_expired_reset_tokens();

-- مثال 5: عرض جميع الرموز النشطة
SELECT 
  id,
  email,
  ip_address,
  expires_at,
  used_at,
  CASE
    WHEN used_at IS NOT NULL THEN 'USED'
    WHEN expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM password_reset_tokens
ORDER BY created_at DESC;

-- مثال 6: حذف رمز معين (للإدارة)
DELETE FROM password_reset_tokens
WHERE email = 'user@example.com';

*/

-- =====================================================
-- 6. التوثيق الكامل (Documentation)
-- =====================================================

/*

┌─────────────────────────────────────────────────────────────┐
│          نظام إعادة تعيين كلمة المرور - Marketna            │
└─────────────────────────────────────────────────────────────┘

📋 المحتويات:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. نظرة عامة
2. بنية الجدول
3. الدوال
4. سياسات الأمان
5. أمثلة الاستخدام
6. التكامل مع Next.js
7. Cron Job
8. استكشاف الأخطاء

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. نظرة عامة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

النظام يوفر:
✅ رموز عشوائية آمنة (64 حرف)
✅ صلاحية لمدة 60 دقيقة
✅ استخدام لمرة واحدة فقط
✅ حذف تلقائي للرموز القديمة
✅ تدقيق أمني (IP tracking)
✅ منع الهجمات (Rate limiting عبر الحذف)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. بنية الجدول
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

العمود          | النوع        | الوصف
────────────────────────────────────────────────────────────
id              | UUID         | المعرف الفريد
user_id         | UUID         | معرف المستخدم
email           | TEXT         | البريد الإلكتروني
token           | TEXT         | الرمز السري (64 حرف)
expires_at      | TIMESTAMPTZ  | انتهاء الصلاحية
used_at         | TIMESTAMPTZ  | وقت الاستخدام
ip_address      | INET         | عنوان IP
created_at      | TIMESTAMPTZ  | تاريخ الإنشاء

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. الدوال
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أ. create_password_reset_token(p_user_id, p_email, p_expires_in_minutes, p_ip_address)
   - تنشئ رمزاً جديداً
   - تحذف الرموز القديمة للمستخدم
   - ترجع الرمز (64 حرف)

ب. claim_password_reset_token(p_token) ⭐ الأهم
   - تتحقق من الرمز وتستهلكه (ذري)
   - تمنع الاستخدام المزدوج
   - ترجع: is_valid, user_id, email, message

ج. verify_password_reset_token(p_token)
   - تتحقق من الرمز بدون استهلاكه
   - للعرض فقط ⚠️
   - ترجع: is_valid, user_id, email, expires_at, message

د. cleanup_expired_reset_tokens()
   - تحذف الرموز المنتهية منذ >30 يوم
   - تحذف الرموز المستخدمة منذ >7 أيام
   - ترجع: عدد المحذوفات

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. سياسات الأمان
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RLS مفعّل
✅ منع القراءة العامة (حتى للمصادقين)
✅ Service Role فقط يملك الوصول الكامل
✅ جميع العمليات عبر Server Actions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. أمثلة الاستخدام
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أ. في requestPasswordReset.ts:
───────────────────────────────────────────────────────────
const token = await supabase.rpc('create_password_reset_token', {
  p_user_id: userId,
  p_email: email,
  p_expires_in_minutes: 60,
  p_ip_address: clientIP
});

const resetLink = `${appUrl}/reset-password?token=${token}`;
await sendPasswordResetEmail({ email, resetLink });
───────────────────────────────────────────────────────────

ب. في resetPassword.ts:
───────────────────────────────────────────────────────────
// ✅ صحيح - استخدام claim (ذري)
const { data } = await supabase.rpc('claim_password_reset_token', {
  p_token: token
});

if (data.is_valid) {
  await supabase.auth.admin.updateUserById(data.user_id, {
    password: newPassword
  });
}
───────────────────────────────────────────────────────────

ج. في reset-password-form.tsx:
───────────────────────────────────────────────────────────
// للعرض فقط (ليس للأمان)
const { isValid, expiresAt } = await verifyResetToken(token);

if (!isValid) {
  // عرض رسالة خطأ
}
───────────────────────────────────────────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. التكامل مع Next.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الملفات المطلوبة:
├── lib/actions/authentication/requestPasswordReset.ts
├── lib/actions/authentication/resetPassword.ts
├── components/auth/reset-password-form.tsx
└── app/[locale]/(auth)/reset-password/page.tsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. Cron Job
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الملف: supabase/sql/cron_cleanup.sql
الجدول: يومياً عند 02:00 UTC

vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 2 * * *"
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. استكشاف الأخطاء
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

المشكلة: "Invalid Token"
الحل:
1. تحقق من أن الرمز 64 حرف
2. تحقق من أن الرمز غير منتهي الصلاحية
3. تحقق من أن الرمز لم يُستخدم مسبقاً
4. تحقق من وجود الرمز في قاعدة البيانات

المشكلة: "column reference is ambiguous"
الحل:
- استخدم اسم الجدول بشكل صريح: prt.expires_at
- حدد أنواع الإرجاع: false::BOOLEAN

المشكلة: الرمز لا يعمل
الحل:
1. تحقق من أن الدوال محدثة
2. شغّل: SELECT * FROM verify_password_reset_token('token')
3. تحقق من Console للأخطاء

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 للمزيد من المعلومات:
- supabase/03_password_reset_tokens/README.md
- docs/PASSWORD_RESET_SYSTEM.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*/

-- =====================================================
-- نهاية الملف
-- =====================================================
