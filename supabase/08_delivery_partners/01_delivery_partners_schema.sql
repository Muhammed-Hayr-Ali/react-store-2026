-- =====================================================
-- Marketna E-Commerce - Delivery Partners Schema
-- File: 01_delivery_partners_schema.sql
-- Description: جدول موظفي التوصيل مع المعلومات الأساسية
-- Dependency: يجب تشغيل 04_roles_permissions_system.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول موظفي التوصيل (Delivery Partners)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- معلومات الشركة/الفردي
  company_name TEXT,
  is_individual BOOLEAN DEFAULT TRUE,

  -- معلومات المركبات
  vehicle_types TEXT[] DEFAULT '{}', -- ['motorcycle', 'car', 'van', 'truck']
  vehicle_details JSONB DEFAULT '[]'::jsonb, -- [{type, plate_number, model, year}]

  -- رخصة السير
  license_number TEXT,
  license_expiry_date DATE,
  license_document_url TEXT,

  -- التأمين
  insurance_number TEXT,
  insurance_expiry_date DATE,
  insurance_document_url TEXT,

  -- مناطق التغطية
  coverage_areas JSONB DEFAULT '[]'::jsonb, -- [{city, zones}]
  max_delivery_radius INTEGER DEFAULT 10, -- بالكيلومتر

  -- معلومات التواصل
  phone TEXT,
  email TEXT,
  address JSONB,

  -- حالة الحساب
  account_status TEXT DEFAULT 'pending' CHECK (account_status = ANY (ARRAY['pending', 'active', 'suspended', 'rejected'])),
  rejection_reason TEXT,

  -- موافقة الأدمن
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- إحصائيات
  total_deliveries INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,

  -- بيانات إضافية
  metadata JSONB DEFAULT '{}'::jsonb,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.delivery_partners IS 'جدول موظفي التوصيل - يحتوي على معلومات السائقين والمركبات';
COMMENT ON COLUMN public.delivery_partners.id IS 'المعرف الفريد لموظف التوصيل';
COMMENT ON COLUMN public.delivery_partners.user_id IS 'معرف المستخدم المرتبط';
COMMENT ON COLUMN public.delivery_partners.profile_id IS 'معرف الملف الشخصي (اختياري)';
COMMENT ON COLUMN public.delivery_partners.company_name IS 'اسم الشركة (للمؤسسات)';
COMMENT ON COLUMN public.delivery_partners.is_individual IS 'هل هو فرد؟ (TRUE = فرد، FALSE = شركة)';
COMMENT ON COLUMN public.delivery_partners.vehicle_types IS 'أنواع المركبات: motorcycle, car, van, truck';
COMMENT ON COLUMN public.delivery_partners.vehicle_details IS 'تفاصيل المركبات: [{type, plate_number, model, year}]';
COMMENT ON COLUMN public.delivery_partners.license_number IS 'رقم رخصة السير';
COMMENT ON COLUMN public.delivery_partners.license_expiry_date IS 'تاريخ انتهاء الرخصة';
COMMENT ON COLUMN public.delivery_partners.license_document_url IS 'رابط وثيقة الرخصة';
COMMENT ON COLUMN public.delivery_partners.insurance_number IS 'رقم التأمين';
COMMENT ON COLUMN public.delivery_partners.insurance_expiry_date IS 'تاريخ انتهاء التأمين';
COMMENT ON COLUMN public.delivery_partners.insurance_document_url IS 'رابط وثيقة التأمين';
COMMENT ON COLUMN public.delivery_partners.coverage_areas IS 'مناطق التغطية: [{city, zones}]';
COMMENT ON COLUMN public.delivery_partners.max_delivery_radius IS 'أقصى نصف قطر للتوصيل (كم)';
COMMENT ON COLUMN public.delivery_partners.phone IS 'رقم الهاتف';
COMMENT ON COLUMN public.delivery_partners.email IS 'البريد الإلكتروني';
COMMENT ON COLUMN public.delivery_partners.address IS 'العنوان: {street, city, state, postal_code, country}';
COMMENT ON COLUMN public.delivery_partners.account_status IS 'حالة الحساب: pending, active, suspended, rejected';
COMMENT ON COLUMN public.delivery_partners.rejection_reason IS 'سبب الرفض';
COMMENT ON COLUMN public.delivery_partners.reviewed_by IS 'من راجع الطلب';
COMMENT ON COLUMN public.delivery_partners.reviewed_at IS 'تاريخ المراجعة';
COMMENT ON COLUMN public.delivery_partners.total_deliveries IS 'إجمالي عدد التوصيلات';
COMMENT ON COLUMN public.delivery_partners.completed_deliveries IS 'عدد التوصيلات المكتملة';
COMMENT ON COLUMN public.delivery_partners.rating IS 'التقييم (0.00 - 5.00)';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON public.delivery_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners(account_status);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_areas ON public.delivery_partners USING gin (coverage_areas);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_vehicle_types ON public.delivery_partners USING gin (vehicle_types);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_rating ON public.delivery_partners(rating DESC);

COMMENT ON INDEX idx_delivery_partners_user_id IS 'فهرس للبحث عن طريق user_id';
COMMENT ON INDEX idx_delivery_partners_status IS 'فهرس لفلترة حسب حالة الحساب';
COMMENT ON INDEX idx_delivery_partners_areas IS 'فهرس للبحث في مناطق التغطية';
COMMENT ON INDEX idx_delivery_partners_vehicle_types IS 'فهرس للبحث في أنواع المركبات';
COMMENT ON INDEX idx_delivery_partners_rating IS 'فهرس للترتيب حسب التقييم';

-- =====================================================
-- 3. دوال إدارة موظفي التوصيل (Management Functions)
-- =====================================================

-- دالة إنشاء سجل موظف توصيل جديد
CREATE OR REPLACE FUNCTION public.create_delivery_partner(
  p_company_name TEXT DEFAULT NULL,
  p_is_individual BOOLEAN DEFAULT TRUE,
  p_vehicle_types TEXT[] DEFAULT '{}',
  p_vehicle_details JSONB DEFAULT '[]'::jsonb,
  p_license_number TEXT DEFAULT NULL,
  p_license_expiry_date DATE DEFAULT NULL,
  p_license_document_url TEXT DEFAULT NULL,
  p_insurance_number TEXT DEFAULT NULL,
  p_insurance_expiry_date DATE DEFAULT NULL,
  p_insurance_document_url TEXT DEFAULT NULL,
  p_coverage_areas JSONB DEFAULT '[]'::jsonb,
  p_max_delivery_radius INTEGER DEFAULT 10,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_partner_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- التحقق من أن المستخدم ليس موظف توصيل بالفعل
  IF EXISTS (SELECT 1 FROM public.delivery_partners WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a delivery partner account';
  END IF;

  -- إنشاء سجل موظف التوصيل
  INSERT INTO public.delivery_partners (
    user_id,
    company_name,
    is_individual,
    vehicle_types,
    vehicle_details,
    license_number,
    license_expiry_date,
    license_document_url,
    insurance_number,
    insurance_expiry_date,
    insurance_document_url,
    coverage_areas,
    max_delivery_radius,
    phone,
    email,
    address,
    account_status
  ) VALUES (
    v_user_id,
    p_company_name,
    p_is_individual,
    p_vehicle_types,
    p_vehicle_details,
    p_license_number,
    p_license_expiry_date,
    p_license_document_url,
    p_insurance_number,
    p_insurance_expiry_date,
    p_insurance_document_url,
    p_coverage_areas,
    p_max_delivery_radius,
    p_phone,
    p_email,
    p_address,
    'pending'
  ) RETURNING id INTO v_partner_id;

  RETURN v_partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_delivery_partner IS 'إنشاء سجل موظف توصيل جديد (الحالة الافتراضية: pending)';

-- دالة الموافقة على موظف توصيل (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.approve_delivery_partner(p_partner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- التحقق من أن المستخدم الحالي مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve delivery partners';
  END IF;

  -- الحصول على user_id من delivery_partner
  SELECT user_id INTO v_user_id FROM public.delivery_partners WHERE id = p_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery partner not found';
  END IF;

  -- تحديث حالة موظف التوصيل
  UPDATE public.delivery_partners
  SET
    account_status = 'active',
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_partner_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_delivery_partner IS 'الموافقة على موظف توصيل وتفعيل حسابه (للأدمن فقط)';

-- دالة رفض موظف توصيل (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.reject_delivery_partner(p_partner_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject delivery partners';
  END IF;

  SELECT user_id INTO v_user_id FROM public.delivery_partners WHERE id = p_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery partner not found';
  END IF;

  UPDATE public.delivery_partners
  SET
    account_status = 'rejected',
    rejection_reason = p_reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_partner_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reject_delivery_partner IS 'رفض موظف توصيل مع تحديد السبب (للأدمن فقط)';

-- دالة إيقاف موظف توصيل (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.suspend_delivery_partner(p_partner_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can suspend delivery partners';
  END IF;

  UPDATE public.delivery_partners
  SET
    account_status = 'suspended',
    rejection_reason = p_reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = p_partner_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.suspend_delivery_partner IS 'إيقاف موظف توصيل مؤقتاً (للأدمن فقط)';

-- دالة تحديث معلومات موظف التوصيل
CREATE OR REPLACE FUNCTION public.update_delivery_partner_info(
  p_partner_id UUID,
  p_company_name TEXT DEFAULT NULL,
  p_vehicle_types TEXT[] DEFAULT NULL,
  p_vehicle_details JSONB DEFAULT NULL,
  p_license_number TEXT DEFAULT NULL,
  p_license_expiry_date DATE DEFAULT NULL,
  p_license_document_url TEXT DEFAULT NULL,
  p_insurance_number TEXT DEFAULT NULL,
  p_insurance_expiry_date DATE DEFAULT NULL,
  p_insurance_document_url TEXT DEFAULT NULL,
  p_coverage_areas JSONB DEFAULT NULL,
  p_max_delivery_radius INTEGER DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_partner RECORD;
BEGIN
  -- التحقق من الملكية
  SELECT * INTO v_partner FROM public.delivery_partners WHERE id = p_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delivery partner not found';
  END IF;

  IF v_partner.user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to update this delivery partner';
  END IF;

  UPDATE public.delivery_partners
  SET
    company_name = COALESCE(p_company_name, company_name),
    vehicle_types = COALESCE(p_vehicle_types, vehicle_types),
    vehicle_details = COALESCE(p_vehicle_details, vehicle_details),
    license_number = COALESCE(p_license_number, license_number),
    license_expiry_date = COALESCE(p_license_expiry_date, license_expiry_date),
    license_document_url = COALESCE(p_license_document_url, license_document_url),
    insurance_number = COALESCE(p_insurance_number, insurance_number),
    insurance_expiry_date = COALESCE(p_insurance_expiry_date, insurance_expiry_date),
    insurance_document_url = COALESCE(p_insurance_document_url, insurance_document_url),
    coverage_areas = COALESCE(p_coverage_areas, coverage_areas),
    max_delivery_radius = COALESCE(p_max_delivery_radius, max_delivery_radius),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    address = COALESCE(p_address, address),
    updated_at = NOW()
  WHERE id = p_partner_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_delivery_partner_info IS 'تحديث معلومات موظف التوصيل (للمالك أو الأدمن)';

-- دالة تحديث تقييم موظف التوصيل
CREATE OR REPLACE FUNCTION public.update_delivery_partner_rating(
  p_partner_id UUID,
  p_rating DECIMAL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.delivery_partners
  SET
    rating = p_rating,
    updated_at = NOW()
  WHERE id = p_partner_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_delivery_partner_rating IS 'تحديث تقييم موظف التوصيل';

-- دالة زيادة عداد التوصيلات
CREATE OR REPLACE FUNCTION public.increment_delivery_stats(
  p_partner_id UUID,
  p_completed BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.delivery_partners
  SET
    total_deliveries = total_deliveries + 1,
    completed_deliveries = CASE WHEN p_completed THEN completed_deliveries + 1 ELSE completed_deliveries END,
    updated_at = NOW()
  WHERE id = p_partner_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.increment_delivery_stats IS 'زيادة عداد توصيلات موظف التوصيل';

-- =====================================================
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: موظف التوصيل يقرأ بياناته فقط
DROP POLICY IF EXISTS "delivery_partners_read_own" ON public.delivery_partners;
CREATE POLICY "delivery_partners_read_own" ON public.delivery_partners FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- سياسة القراءة للأدمن: الأدمن يقرأ جميع موظفي التوصيل
DROP POLICY IF EXISTS "delivery_partners_admin_read_all" ON public.delivery_partners;
CREATE POLICY "delivery_partners_admin_read_all" ON public.delivery_partners FOR SELECT
  TO authenticated USING (public.is_admin());

-- سياسة الإدراج: المستخدم ينشئ موظف توصيل خاص به
DROP POLICY IF EXISTS "delivery_partners_insert_own" ON public.delivery_partners;
CREATE POLICY "delivery_partners_insert_own" ON public.delivery_partners FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- سياسة التحديث: موظف التوصيل يحدث بياناته فقط
DROP POLICY IF EXISTS "delivery_partners_update_own" ON public.delivery_partners;
CREATE POLICY "delivery_partners_update_own" ON public.delivery_partners FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- سياسة الحذف: الأدمن فقط يحذف
DROP POLICY IF EXISTS "delivery_partners_admin_delete" ON public.delivery_partners;
CREATE POLICY "delivery_partners_admin_delete" ON public.delivery_partners FOR DELETE
  TO authenticated USING (public.is_admin());

-- سياسة الإدارة الكاملة للأدمن
DROP POLICY IF EXISTS "delivery_partners_admin_manage" ON public.delivery_partners;
CREATE POLICY "delivery_partners_admin_manage" ON public.delivery_partners FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_delivery_partners_updated_at ON public.delivery_partners;
CREATE TRIGGER update_delivery_partners_updated_at
  BEFORE UPDATE ON public.delivery_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار تغيير حالة موظف التوصيل
CREATE OR REPLACE FUNCTION notify_delivery_partner_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_status != OLD.account_status THEN
    PERFORM pg_notify(
      'delivery_partner_status_changed',
      json_build_object(
        'partner_id', NEW.id,
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

DROP TRIGGER IF EXISTS delivery_partner_status_change_trigger ON public.delivery_partners;
CREATE TRIGGER delivery_partner_status_change_trigger
  AFTER UPDATE ON public.delivery_partners
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_partner_status_change();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 04_roles_permissions_system.sql
-- 2. جدول profiles اختياري - إذا لم يكن موجوداً احذف profile_id
-- 3. حالة الحساب الافتراضية هي 'pending' حتى يوافق الأدمن
-- 4. vehicle_types: ['motorcycle', 'car', 'van', 'truck']
-- 5. coverage_areas: [{city: 'الرياض', zones: ['العليا', 'الملقا']}]
