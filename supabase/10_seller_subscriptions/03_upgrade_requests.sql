-- =====================================================
-- Marketna E-Commerce - Seller Upgrade Requests Schema
-- File: 03_upgrade_requests.sql
-- Description: جدول طلبات ترقية اشتراكات الباعة
-- Dependency: يجب تشغيل 02_seller_subscriptions.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول طلبات ترقية الباعة (Seller Upgrade Requests)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  current_plan_id UUID REFERENCES public.seller_subscription_plans(id),
  target_plan_id UUID NOT NULL REFERENCES public.seller_subscription_plans(id),
  
  -- حالة الطلب
  status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'completed'])),
  
  -- معلومات التواصل
  contact_method TEXT CHECK (contact_method = ANY (ARRAY['email', 'phone', 'whatsapp'])),
  contact_value TEXT,
  
  -- ملاحظات
  seller_notes TEXT,
  admin_notes TEXT,
  
  -- التواريخ
  contacted_at TIMESTAMPTZ,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.seller_upgrade_requests IS 'طلبات ترقية اشتراكات الباعة';
COMMENT ON COLUMN public.seller_upgrade_requests.status IS 'حالة الطلب: pending, approved, rejected, completed';
COMMENT ON COLUMN public.seller_upgrade_requests.contact_method IS 'طريقة التواصل المفضلة: email, phone, whatsapp';
COMMENT ON COLUMN public.seller_upgrade_requests.contact_value IS 'معلومات التواصل (email أو phone)';
COMMENT ON COLUMN public.seller_upgrade_requests.seller_notes IS 'ملاحظات البائع';
COMMENT ON COLUMN public.seller_upgrade_requests.admin_notes IS 'ملاحظات الإدارة';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_seller_upgrade_requests_seller ON public.seller_upgrade_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_upgrade_requests_status ON public.seller_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_seller_upgrade_requests_created ON public.seller_upgrade_requests(created_at DESC);

-- =====================================================
-- 3. دوال إدارة طلبات الترقية (Management Functions)
-- =====================================================

-- دالة إنشاء طلب ترقية جديد
CREATE OR REPLACE FUNCTION public.create_upgrade_request(
  p_seller_id UUID,
  p_target_plan_id UUID,
  p_contact_method TEXT,
  p_contact_value TEXT,
  p_seller_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_current_plan_id UUID;
BEGIN
  -- الحصول على الخطة الحالية (إن وجدت)
  SELECT plan_id INTO v_current_plan_id
  FROM public.seller_subscriptions
  WHERE seller_id = p_seller_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- إنشاء طلب الترقية
  INSERT INTO public.seller_upgrade_requests (
    seller_id,
    current_plan_id,
    target_plan_id,
    status,
    contact_method,
    contact_value,
    seller_notes
  ) VALUES (
    p_seller_id,
    v_current_plan_id,
    p_target_plan_id,
    'pending',
    p_contact_method,
    p_contact_value,
    p_seller_notes
  ) RETURNING id INTO v_request_id;

  -- إرسال إشعار للإدارة
  PERFORM pg_notify(
    'upgrade_request_created',
    json_build_object(
      'request_id', v_request_id,
      'seller_id', p_seller_id,
      'target_plan_id', p_target_plan_id,
      'contact_method', p_contact_method,
      'contact_value', p_contact_value
    )::text
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_upgrade_request IS 'إنشاء طلب ترقية اشتراك جديد';

-- دالة الموافقة على طلب الترقية
CREATE OR REPLACE FUNCTION public.approve_upgrade_request(
  p_request_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من أن المستخدم مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve upgrade requests';
  END IF;

  -- تحديث حالة الطلب
  UPDATE public.seller_upgrade_requests
  SET
    status = 'approved',
    admin_notes = p_admin_notes,
    contacted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found or already processed';
  END IF;

  -- إرسال إشعار للمستخدم
  PERFORM pg_notify(
    'upgrade_request_approved',
    json_build_object(
      'request_id', p_request_id
    )::text
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_upgrade_request IS 'الموافقة على طلب الترقية (للأدمن)';

-- دالة رفض طلب الترقية
CREATE OR REPLACE FUNCTION public.reject_upgrade_request(
  p_request_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من أن المستخدم مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject upgrade requests';
  END IF;

  -- تحديث حالة الطلب
  UPDATE public.seller_upgrade_requests
  SET
    status = 'rejected',
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_request_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found or already processed';
  END IF;

  -- إرسال إشعار للمستخدم
  PERFORM pg_notify(
    'upgrade_request_rejected',
    json_build_object(
      'request_id', p_request_id
    )::text
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reject_upgrade_request IS 'رفض طلب الترقية (للأدمن)';

-- دالة إكمال الترقية (بعد استلام الدفع)
CREATE OR REPLACE FUNCTION public.complete_upgrade_request(
  p_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request RECORD;
  v_seller_id UUID;
  v_target_plan_id UUID;
BEGIN
  -- التحقق من أن المستخدم مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can complete upgrade requests';
  END IF;

  -- الحصول على معلومات الطلب
  SELECT * INTO v_request
  FROM public.seller_upgrade_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found';
  END IF;

  IF v_request.status != 'approved' THEN
    RAISE EXCEPTION 'Upgrade request must be approved before completion';
  END IF;

  -- تحديث حالة الطلب
  UPDATE public.seller_upgrade_requests
  SET
    status = 'completed',
    payment_received_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- إنشاء/تحديث الاشتراك
  INSERT INTO public.seller_subscriptions (
    seller_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_provider,
    amount_paid,
    currency
  ) VALUES (
    v_request.seller_id,
    v_request.target_plan_id,
    'active',
    NOW(),
    CASE 
      WHEN (SELECT billing_period FROM seller_subscription_plans WHERE id = v_request.target_plan_id) = 'yearly'
      THEN NOW() + INTERVAL '1 year'
      ELSE NOW() + INTERVAL '1 month'
    END,
    'manual',
    (SELECT price_usd FROM seller_subscription_plans WHERE id = v_request.target_plan_id),
    'USD'
  )
  ON CONFLICT (seller_id) DO UPDATE SET
    plan_id = v_request.target_plan_id,
    status = 'active',
    updated_at = NOW();

  -- إرسال إشعار للمستخدم
  PERFORM pg_notify(
    'upgrade_completed',
    json_build_object(
      'request_id', p_request_id,
      'seller_id', v_request.seller_id
    )::text
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.complete_upgrade_request IS 'إكمال الترقية بعد استلام الدفع (للأدمن)';

-- دالة الحصول على طلبات الترقية للبائع
CREATE OR REPLACE FUNCTION public.get_seller_upgrade_requests(p_seller_id UUID DEFAULT NULL)
RETURNS TABLE(
  request_id UUID,
  current_plan_name TEXT,
  target_plan_name TEXT,
  target_plan_price DECIMAL,
  status TEXT,
  contact_method TEXT,
  contact_value TEXT,
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rur.id,
    cp.name,
    tp.name,
    tp.price_usd,
    rur.status,
    rur.contact_method,
    rur.contact_value,
    rur.admin_notes,
    rur.contacted_at,
    rur.payment_received_at,
    rur.completed_at,
    rur.created_at
  FROM public.seller_upgrade_requests rur
  LEFT JOIN public.seller_subscription_plans cp ON cp.id = rur.current_plan_id
  LEFT JOIN public.seller_subscription_plans tp ON tp.id = rur.target_plan_id
  WHERE rur.seller_id = COALESCE(p_seller_id, (SELECT id FROM public.sellers WHERE user_id = auth.uid()))
  ORDER BY rur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_seller_upgrade_requests IS 'الحصول على طلبات ترقية البائع';

-- دالة الحصول على طلبات الترقية للإدارة
CREATE OR REPLACE FUNCTION public.get_all_upgrade_requests(p_status TEXT DEFAULT NULL)
RETURNS TABLE(
  request_id UUID,
  seller_name TEXT,
  store_name TEXT,
  seller_email TEXT,
  current_plan_name TEXT,
  target_plan_name TEXT,
  target_plan_price DECIMAL,
  status TEXT,
  contact_method TEXT,
  contact_value TEXT,
  seller_notes TEXT,
  admin_notes TEXT,
  contacted_at TIMESTAMPTZ,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rur.id,
    CONCAT(u.first_name, ' ', u.last_name),
    s.store_name,
    s.email,
    cp.name,
    tp.name,
    tp.price_usd,
    rur.status,
    rur.contact_method,
    rur.contact_value,
    rur.seller_notes,
    rur.admin_notes,
    rur.contacted_at,
    rur.payment_received_at,
    rur.completed_at,
    rur.created_at
  FROM public.seller_upgrade_requests rur
  JOIN public.sellers s ON s.id = rur.seller_id
  LEFT JOIN public.profiles u ON u.id = s.user_id
  LEFT JOIN public.seller_subscription_plans cp ON cp.id = rur.current_plan_id
  LEFT JOIN public.seller_subscription_plans tp ON tp.id = rur.target_plan_id
  WHERE p_status IS NULL OR rur.status = p_status
  ORDER BY rur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_all_upgrade_requests IS 'الحصول على جميع طلبات الترقية (للأدمن)';

-- =====================================================
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.seller_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: البائع يقرأ طلباته فقط
DROP POLICY IF EXISTS "seller_upgrade_requests_read_own" ON public.seller_upgrade_requests;
CREATE POLICY "seller_upgrade_requests_read_own" ON public.seller_upgrade_requests FOR SELECT
  TO authenticated USING (
    seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- سياسة الإدراج: البائع ينشئ طلب ترقية لنفسه
DROP POLICY IF EXISTS "seller_upgrade_requests_insert_own" ON public.seller_upgrade_requests;
CREATE POLICY "seller_upgrade_requests_insert_own" ON public.seller_upgrade_requests FOR INSERT
  TO authenticated WITH CHECK (
    seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
  );

-- سياسة التحديث: الإدارة فقط
DROP POLICY IF EXISTS "seller_upgrade_requests_admin_update" ON public.seller_upgrade_requests;
CREATE POLICY "seller_upgrade_requests_admin_update" ON public.seller_upgrade_requests FOR UPDATE
  TO authenticated USING (public.is_admin());

-- سياسة الإدارة الكاملة للأدمن
DROP POLICY IF EXISTS "seller_upgrade_requests_admin_manage" ON public.seller_upgrade_requests;
CREATE POLICY "seller_upgrade_requests_admin_manage" ON public.seller_upgrade_requests FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_seller_upgrade_requests_updated_at ON public.seller_upgrade_requests;
CREATE TRIGGER update_seller_upgrade_requests_updated_at
  BEFORE UPDATE ON public.seller_upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار إنشاء طلب ترقية
CREATE OR REPLACE FUNCTION notify_upgrade_request_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'upgrade_request_created',
    json_build_object(
      'request_id', NEW.id,
      'seller_id', NEW.seller_id,
      'target_plan_id', NEW.target_plan_id,
      'contact_method', NEW.contact_method,
      'contact_value', NEW.contact_value,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS upgrade_request_created_trigger ON public.seller_upgrade_requests;
CREATE TRIGGER upgrade_request_created_trigger
  AFTER INSERT ON public.seller_upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION notify_upgrade_request_created();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 02_seller_subscriptions.sql
-- 2. البائع يمكنه إنشاء طلب ترقية واحد معلق في نفس الوقت
-- 3. الإدارة فقط يمكنها الموافقة/الرفض/الإكمال
-- 4. يتم إرسال إشعارات للإدارة عند إنشاء طلب جديد
-- 5. يتم إرسال إشعارات للبائع عند تغيير حالة الطلب
