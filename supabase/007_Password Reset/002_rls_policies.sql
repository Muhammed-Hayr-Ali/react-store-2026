-- =====================================================
-- 🔐 Password Reset — RLS Policies
-- =====================================================
-- ⚠️ يعتمد على: جدول auth_password_reset (مفعّل RLS بالفعل)
-- =====================================================

-- التأكد من تفعيل RLS
ALTER TABLE public.auth_password_reset ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- سياسة 1: منع القراءة العامة (الأمان)
-- =====================================================
DROP POLICY IF EXISTS "password_reset_no_public_read" ON public.auth_password_reset;
CREATE POLICY "password_reset_no_public_read"
  ON public.auth_password_reset FOR SELECT
  TO authenticated
  USING (false);

COMMENT ON POLICY "password_reset_no_public_read" ON public.auth_password_reset
  IS 'منع أي قراءة عامة — الرموز سرية تماماً';

-- =====================================================
-- سياسة 2: صلاحيات كاملة لخدمة الخادم
-- =====================================================
DROP POLICY IF EXISTS "password_reset_service_full_access" ON public.auth_password_reset;
CREATE POLICY "password_reset_service_full_access"
  ON public.auth_password_reset FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "password_reset_service_full_access" ON public.auth_password_reset
  IS 'خدمة الخادم فقط تملك صلاحية كاملة';

-- =====================================================
-- سياسة 3: المستخدم يرى طلباته فقط
-- =====================================================
DROP POLICY IF EXISTS "password_reset_user_own" ON public.auth_password_reset;
CREATE POLICY "password_reset_user_own"
  ON public.auth_password_reset FOR SELECT
  TO authenticated
  USING (profile_id = public.current_user_id());

COMMENT ON POLICY "password_reset_user_own" ON public.auth_password_reset
  IS 'المستخدم يرى طلبات الاستعادة الخاصة به فقط';

-- =====================================================
-- ✅ Verification
-- =====================================================

SELECT
  '✅ Password reset RLS policies created!' AS status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'auth_password_reset') AS policy_count;

-- النتيجة المتوقعة: 3 سياسات
