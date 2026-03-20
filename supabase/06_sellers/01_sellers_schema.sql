-- =====================================================
-- Marketna E-Commerce - Sellers Table Schema
-- File: 01_sellers_schema.sql
-- Description: جدول الباعة مع المعلومات الأساسية للمتجر
-- Dependency: يجب تشغيل 01_roles_permissions_system.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول الباعة (Sellers/Vendors)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- معلومات المتجر الأساسية
  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE,
  store_description TEXT,
  store_logo_url TEXT,
  store_banner_url TEXT,

  -- معلومات التواصل
  phone TEXT,
  email TEXT,
  address JSONB, -- {street, city, state, postal_code, country}

  -- معلومات ضريبية
  tax_number TEXT,
  commercial_registration TEXT,

  -- حالة الحساب
  account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'rejected')),
  rejection_reason TEXT, -- سبب الرفض

  -- موافقة الأدمن
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- بيانات إضافية
  metadata JSONB DEFAULT '{}'::jsonb,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sellers IS 'جدول الباعة - يحتوي على معلومات المتاجر والبائعين';
COMMENT ON COLUMN public.sellers.id IS 'المعرف الفريد للبائع';
COMMENT ON COLUMN public.sellers.user_id IS 'معرف المستخدم المرتبط بالبائع';
COMMENT ON COLUMN public.sellers.profile_id IS 'معرف الملف الشخصي (اختياري)';
COMMENT ON COLUMN public.sellers.store_name IS 'اسم المتجر';
COMMENT ON COLUMN public.sellers.store_slug IS 'رابط المتجر الفريد (URL-friendly)';
COMMENT ON COLUMN public.sellers.store_description IS 'وصف المتجر';
COMMENT ON COLUMN public.sellers.store_logo_url IS 'رابط شعار المتجر';
COMMENT ON COLUMN public.sellers.store_banner_url IS 'رابط صورة الغلاف للمتجر';
COMMENT ON COLUMN public.sellers.phone IS 'رقم هاتف المتجر';
COMMENT ON COLUMN public.sellers.email IS 'البريد الإلكتروني للمتجر';
COMMENT ON COLUMN public.sellers.address IS 'عنوان المتجر (JSONB)';
COMMENT ON COLUMN public.sellers.tax_number IS 'الرقم الضريبي';
COMMENT ON COLUMN public.sellers.commercial_registration IS 'الرقم التجاري';
COMMENT ON COLUMN public.sellers.account_status IS 'حالة حساب البائع: pending, active, suspended, rejected';
COMMENT ON COLUMN public.sellers.rejection_reason IS 'سبب رفض طلب البائع';
COMMENT ON COLUMN public.sellers.reviewed_by IS 'من راجع الطلب (معرف المستخدم)';
COMMENT ON COLUMN public.sellers.reviewed_at IS 'تاريخ المراجعة';
COMMENT ON COLUMN public.sellers.metadata IS 'بيانات إضافية (JSONB)';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON public.sellers(account_status);
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON public.sellers(store_slug);
CREATE INDEX IF NOT EXISTS idx_sellers_search ON public.sellers USING gin (store_name gin_trgm_ops);

COMMENT ON INDEX idx_sellers_user_id IS 'فهرس للبحث عن طريق user_id';
COMMENT ON INDEX idx_sellers_status IS 'فهرس لفلترة الباعة حسب الحالة';
COMMENT ON INDEX idx_sellers_slug IS 'فهرس للبحث عن طريق store_slug';
COMMENT ON INDEX idx_sellers_search IS 'فهرس للبحث النصي في اسم المتجر';

-- =====================================================
-- 3. دوال إدارة الباعة (Management Functions)
-- =====================================================

-- دالة إنشاء سجل بائع جديد
CREATE OR REPLACE FUNCTION public.create_seller(
  p_store_name TEXT,
  p_store_description TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_tax_number TEXT DEFAULT NULL,
  p_commercial_registration TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_seller_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- التحقق من أن المستخدم ليس بائعاً بالفعل
  IF EXISTS (SELECT 1 FROM public.sellers WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a seller account';
  END IF;

  -- إنشاء سجل البائع
  INSERT INTO public.sellers (
    user_id,
    store_name,
    store_slug,
    store_description,
    phone,
    email,
    address,
    tax_number,
    commercial_registration,
    account_status
  ) VALUES (
    v_user_id,
    p_store_name,
    LOWER(REGEXP_REPLACE(p_store_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(v_user_id::text, 1, 8),
    p_store_description,
    p_phone,
    p_email,
    p_address,
    p_tax_number,
    p_commercial_registration,
    'pending'
  ) RETURNING id INTO v_seller_id;

  RETURN v_seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_seller IS 'إنشاء سجل بائع جديد (الحالة الافتراضية: pending)';

-- دالة الموافقة على بائع (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.approve_seller(p_seller_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- التحقق من أن المستخدم الحالي مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve sellers';
  END IF;

  -- الحصول على user_id من seller
  SELECT user_id INTO v_user_id FROM public.sellers WHERE id = p_seller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller not found';
  END IF;

  -- تحديث حالة البائع
  UPDATE public.sellers
  SET
    account_status = 'active',
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_seller_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_seller IS 'الموافقة على بائع وتفعيل حسابه (للأدمن فقط)';

-- دالة رفض بائع (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.reject_seller(p_seller_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject sellers';
  END IF;

  SELECT user_id INTO v_user_id FROM public.sellers WHERE id = p_seller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller not found';
  END IF;

  UPDATE public.sellers
  SET
    account_status = 'rejected',
    rejection_reason = p_reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_seller_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reject_seller IS 'رفض بائع مع تحديد السبب (للأدمن فقط)';

-- دالة إيقاف بائع (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.suspend_seller(p_seller_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can suspend sellers';
  END IF;

  UPDATE public.sellers
  SET
    account_status = 'suspended',
    rejection_reason = p_reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_seller_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.suspend_seller IS 'إيقاف بائع مؤقتاً (للأدمن فقط)';

-- دالة تحديث معلومات المتجر
CREATE OR REPLACE FUNCTION public.update_seller_store(
  p_seller_id UUID,
  p_store_name TEXT DEFAULT NULL,
  p_store_description TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL,
  p_store_logo_url TEXT DEFAULT NULL,
  p_store_banner_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_seller RECORD;
BEGIN
  -- التحقق من الملكية
  SELECT * INTO v_seller FROM public.sellers WHERE id = p_seller_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller not found';
  END IF;

  IF v_seller.user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to update this seller';
  END IF;

  UPDATE public.sellers
  SET
    store_name = COALESCE(p_store_name, store_name),
    store_description = COALESCE(p_store_description, store_description),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    address = COALESCE(p_address, address),
    store_logo_url = COALESCE(p_store_logo_url, store_logo_url),
    store_banner_url = COALESCE(p_store_banner_url, store_banner_url),
    updated_at = NOW()
  WHERE id = p_seller_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_seller_store IS 'تحديث معلومات المتجر (للبائع أو الأدمن)';

-- =====================================================
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: البائع يقرأ بياناته فقط
DROP POLICY IF EXISTS "sellers_read_own" ON public.sellers;
CREATE POLICY "sellers_read_own" ON public.sellers FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- سياسة القراءة للأدمن: الأدمن يقرأ جميع الباعة
DROP POLICY IF EXISTS "sellers_admin_read_all" ON public.sellers;
CREATE POLICY "sellers_admin_read_all" ON public.sellers FOR SELECT
  TO authenticated USING (public.is_admin());

-- سياسة الإدراج: المستخدم ينشئ بائع خاص به
DROP POLICY IF EXISTS "sellers_insert_own" ON public.sellers;
CREATE POLICY "sellers_insert_own" ON public.sellers FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- سياسة التحديث: البائع يحدث بياناته فقط
DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;
CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- سياسة الحذف: الأدمن فقط يحذف
DROP POLICY IF EXISTS "sellers_admin_delete" ON public.sellers;
CREATE POLICY "sellers_admin_delete" ON public.sellers FOR DELETE
  TO authenticated USING (public.is_admin());

-- سياسة الإدارة الكاملة للأدمن
DROP POLICY IF EXISTS "sellers_admin_manage" ON public.sellers;
CREATE POLICY "sellers_admin_manage" ON public.sellers FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار تغيير حالة البائع
CREATE OR REPLACE FUNCTION notify_seller_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_status != OLD.account_status THEN
    PERFORM pg_notify(
      'seller_status_changed',
      json_build_object(
        'seller_id', NEW.id,
        'user_id', NEW.user_id,
        'old_status', OLD.account_status,
        'new_status', NEW.account_status,
        'rejection_reason', NEW.rejection_reason
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seller_status_change_trigger ON public.sellers;
CREATE TRIGGER seller_status_change_trigger
  AFTER UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION notify_seller_status_change();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 01_roles_permissions_system.sql
-- 2. يجب تشغيل ملف الأدوار والصلاحيات أولاً
-- 3. جدول profiles يجب أن يكون موجود مسبقاً (اختياري)
-- 4. حالة البائع الافتراضية هي 'pending' حتى يوافق الأدمن
