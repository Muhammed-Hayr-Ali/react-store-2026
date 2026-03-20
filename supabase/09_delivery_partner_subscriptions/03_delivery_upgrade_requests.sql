-- =====================================================
-- Marketna E-Commerce - Delivery Upgrade Requests Schema
-- File: 03_delivery_upgrade_requests.sql
-- Description: جدول طلبات ترقية اشتراكات موظفي التوصيل
-- Dependency: يجب تشغيل 02_delivery_partner_subscriptions.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول طلبات ترقية التوصيل (Delivery Upgrade Requests)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
  current_plan_id UUID REFERENCES public.delivery_subscription_plans(id),
  target_plan_id UUID NOT NULL REFERENCES public.delivery_subscription_plans(id),
  
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

COMMENT ON TABLE public.delivery_upgrade_requests IS 'طلبات ترقية اشتراكات موظفي التوصيل';
COMMENT ON COLUMN public.delivery_upgrade_requests.status IS 'حالة الطلب: pending, approved, rejected, completed';
COMMENT ON COLUMN public.delivery_upgrade_requests.contact_method IS 'طريقة التواصل المفضلة: email, phone, whatsapp';
COMMENT ON COLUMN public.delivery_upgrade_requests.contact_value IS 'معلومات التواصل (email أو phone)';
COMMENT ON COLUMN public.delivery_upgrade_requests.seller_notes IS 'ملاحظات السائق';
COMMENT ON COLUMN public.delivery_upgrade_requests.admin_notes IS 'ملاحظات الإدارة';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_upgrade_requests_partner ON public.delivery_upgrade_requests(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_upgrade_requests_status ON public.delivery_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_delivery_upgrade_requests_created ON public.delivery_upgrade_requests(created_at DESC);

-- =====================================================
-- 3. دوال إدارة طلبات الترقية (Management Functions)
-- =====================================================

-- دالة إنشاء طلب ترقية جديد
CREATE OR REPLACE FUNCTION public.create_delivery_upgrade_request(
  p_partner_id UUID,
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
  FROM public.delivery_partner_subscriptions
  WHERE delivery_partner_id = p_partner_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- إنشاء طلب الترقية
  INSERT INTO public.delivery_upgrade_requests (
    delivery_partner_id,
    current_plan_id,
    target_plan_id,
    status,
    contact_method,
    contact_value,
    seller_notes
  ) VALUES (
    p_partner_id,
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
      'delivery_partner_id', p_partner_id,
      'target_plan_id', p_target_plan_id,
      'contact_method', p_contact_method,
      'contact_value', p_contact_value
    )::text
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_delivery_upgrade_request IS 'إنشاء طلب ترقية اشتراك جديد للسائق';

-- دالة الموافقة على طلب الترقية
CREATE OR REPLACE FUNCTION public.approve_delivery_upgrade_request(
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
  UPDATE public.delivery_upgrade_requests
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

COMMENT ON FUNCTION public.approve_delivery_upgrade_request IS 'الموافقة على طلب الترقية (للأدمن)';

-- دالة رفض طلب الترقية
CREATE OR REPLACE FUNCTION public.reject_delivery_upgrade_request(
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
  UPDATE public.delivery_upgrade_requests
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

COMMENT ON FUNCTION public.reject_delivery_upgrade_request IS 'رفض طلب الترقية (للأدمن)';

-- دالة إكمال الترقية (بعد استلام الدفع)
CREATE OR REPLACE FUNCTION public.complete_delivery_upgrade_request(
  p_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_request RECORD;
  v_partner_id UUID;
  v_target_plan_id UUID;
BEGIN
  -- التحقق من أن المستخدم مدير
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can complete upgrade requests';
  END IF;

  -- الحصول على معلومات الطلب
  SELECT * INTO v_request
  FROM public.delivery_upgrade_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade request not found';
  END IF;

  IF v_request.status != 'approved' THEN
    RAISE EXCEPTION 'Upgrade request must be approved before completion';
  END IF;

  -- تحديث حالة الطلب
  UPDATE public.delivery_upgrade_requests
  SET
    status = 'completed',
    payment_received_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- إنشاء/تحديث الاشتراك
  INSERT INTO public.delivery_partner_subscriptions (
    delivery_partner_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_provider,
    amount_paid,
    currency
  ) VALUES (
    v_request.delivery_partner_id,
    v_request.target_plan_id,
    'active',
    NOW(),
    CASE 
      WHEN (SELECT billing_period FROM delivery_subscription_plans WHERE id = v_request.target_plan_id) = 'yearly'
      THEN NOW() + INTERVAL '1 year'
      ELSE NOW() + INTERVAL '1 month'
    END,
    'manual',
    (SELECT price_usd FROM delivery_subscription_plans WHERE id = v_request.target_plan_id),
    'USD'
  )
  ON CONFLICT (delivery_partner_id) DO UPDATE SET
    plan_id = v_request.target_plan_id,
    status = 'active',
    updated_at = NOW();

  -- إرسال إشعار للمستخدم
  PERFORM pg_notify(
    'upgrade_completed',
    json_build_object(
      'request_id', p_request_id,
      'delivery_partner_id', v_request.delivery_partner_id
    )::text
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.complete_delivery_upgrade_request IS 'إكمال الترقية بعد استلام الدفع (للأدمن)';

-- دالة الحصول على طلبات الترقية للسائق
CREATE OR REPLACE FUNCTION public.get_delivery_upgrade_requests(p_partner_id UUID DEFAULT NULL)
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
  FROM public.delivery_upgrade_requests rur
  LEFT JOIN public.delivery_subscription_plans cp ON cp.id = rur.current_plan_id
  LEFT JOIN public.delivery_subscription_plans tp ON tp.id = rur.target_plan_id
  WHERE rur.delivery_partner_id = COALESCE(p_partner_id, (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()))
  ORDER BY rur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_delivery_upgrade_requests IS 'الحصول على طلبات ترقية السائق';

-- =====================================================
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.delivery_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: السائق يقرأ طلباته فقط
DROP POLICY IF EXISTS "delivery_upgrade_requests_read_own" ON public.delivery_upgrade_requests;
CREATE POLICY "delivery_upgrade_requests_read_own" ON public.delivery_upgrade_requests FOR SELECT
  TO authenticated USING (
    delivery_partner_id = (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- سياسة الإدراج: السائق ينشئ طلب ترقية لنفسه
DROP POLICY IF EXISTS "delivery_upgrade_requests_insert_own" ON public.delivery_upgrade_requests;
CREATE POLICY "delivery_upgrade_requests_insert_own" ON public.delivery_upgrade_requests FOR INSERT
  TO authenticated WITH CHECK (
    delivery_partner_id = (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid())
  );

-- سياسة التحديث: الإدارة فقط
DROP POLICY IF EXISTS "delivery_upgrade_requests_admin_update" ON public.delivery_upgrade_requests;
CREATE POLICY "delivery_upgrade_requests_admin_update" ON public.delivery_upgrade_requests FOR UPDATE
  TO authenticated USING (public.is_admin());

-- سياسة الإدارة الكاملة للأدمن
DROP POLICY IF EXISTS "delivery_upgrade_requests_admin_manage" ON public.delivery_upgrade_requests;
CREATE POLICY "delivery_upgrade_requests_admin_manage" ON public.delivery_upgrade_requests FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_delivery_upgrade_requests_updated_at ON public.delivery_upgrade_requests;
CREATE TRIGGER update_delivery_upgrade_requests_updated_at
  BEFORE UPDATE ON public.delivery_upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار إنشاء طلب ترقية
CREATE OR REPLACE FUNCTION notify_delivery_upgrade_request_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'upgrade_request_created',
    json_build_object(
      'request_id', NEW.id,
      'delivery_partner_id', NEW.delivery_partner_id,
      'target_plan_id', NEW.target_plan_id,
      'contact_method', NEW.contact_method,
      'contact_value', NEW.contact_value,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delivery_upgrade_request_created_trigger ON public.delivery_upgrade_requests;
CREATE TRIGGER delivery_upgrade_request_created_trigger
  AFTER INSERT ON public.delivery_upgrade_requests
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_upgrade_request_created();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 02_delivery_partner_subscriptions.sql
-- 2. السائق يمكنه إنشاء طلب ترقية واحد معلق في نفس الوقت
-- 3. الإدارة فقط يمكنها الموافقة/الرفض/الإكمال
-- 4. يتم إرسال إشعارات للإدارة عند إنشاء طلب جديد
-- 5. يتم إرسال إشعارات للسائق عند تغيير حالة الطلب
