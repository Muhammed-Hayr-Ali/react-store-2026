-- =====================================================
-- Marketna E-Commerce - Delivery Partner Subscriptions Schema
-- File: 02_delivery_partner_subscriptions.sql
-- Description: جدول اشتراكات موظفي التوصيل الفعلية
-- Dependency: يجب تشغيل 01_delivery_subscription_plans.sql و 07_delivery_partners أولاً
-- =====================================================

-- =====================================================
-- 1. جدول اشتراكات موظفي التوصيل (Delivery Partner Subscriptions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.delivery_subscription_plans(id),

  -- حالة الاشتراك
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),

  -- التواريخ
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- الدفع
  payment_provider TEXT,
  payment_intent_id TEXT,
  last_payment_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,

  -- السعر المدفوع
  amount_paid DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',

  -- إحصائيات الاستخدام
  orders_completed_this_month INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,

  -- ملاحظات
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.delivery_partner_subscriptions IS 'اشتراكات موظفي التوصيل الفعلية';
COMMENT ON COLUMN public.delivery_partner_subscriptions.status IS 'حالة الاشتراك: active, expired, cancelled, pending, trial';
COMMENT ON COLUMN public.delivery_partner_subscriptions.payment_provider IS 'مزود الدفع: stripe, paypal, manual';
COMMENT ON COLUMN public.delivery_partner_subscriptions.orders_completed_this_month IS 'عدد الطلبات المكتملة هذا الشهر';
COMMENT ON COLUMN public.delivery_partner_subscriptions.total_earnings IS 'إجمالي الأرباح';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_partner ON public.delivery_partner_subscriptions(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_plan ON public.delivery_partner_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_status ON public.delivery_partner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_end_date ON public.delivery_partner_subscriptions(end_date);

-- =====================================================
-- 3. دوال إدارة اشتراكات التوصيل (Management Functions)
-- =====================================================

-- دالة الحصول على اشتراك السائق الحالي
CREATE OR REPLACE FUNCTION public.get_delivery_partner_subscription(p_partner_id UUID DEFAULT NULL)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  plan_name_ar TEXT,
  price_usd DECIMAL,
  max_orders_per_day INTEGER,
  commission_rate DECIMAL,
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  orders_completed_this_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dps.id,
    dsp.name,
    dsp.name_ar,
    dsp.price_usd,
    dsp.max_orders_per_day,
    dsp.commission_rate,
    dps.status,
    dps.start_date,
    dps.end_date,
    dps.orders_completed_this_month
  FROM public.delivery_partner_subscriptions dps
  JOIN public.delivery_subscription_plans dsp ON dsp.id = dps.plan_id
  WHERE dps.delivery_partner_id = COALESCE(p_partner_id, (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()))
    AND dps.status = 'active'
    AND dsp.plan_type = 'delivery_partner'
  ORDER BY dps.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_delivery_partner_subscription IS 'الحصول على اشتراك موظف التوصيل الحالي';

-- دالة التحقق من حد الطلبات
CREATE OR REPLACE FUNCTION public.can_accept_order(p_partner_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_orders INTEGER;
  v_current_orders INTEGER;
  v_subscription_active BOOLEAN;
BEGIN
  -- الحصول على حد الطلبات من الاشتراك الحالي
  SELECT dsp.max_orders_per_day,
         EXISTS(SELECT 1 FROM public.delivery_partner_subscriptions WHERE delivery_partner_id = p_partner_id AND status = 'active')
  INTO v_max_orders, v_subscription_active
  FROM public.delivery_partner_subscriptions dps
  JOIN public.delivery_subscription_plans dsp ON dsp.id = dps.plan_id
  WHERE dps.delivery_partner_id = COALESCE(p_partner_id, (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()))
    AND dps.status = 'active'
    AND dsp.plan_type = 'delivery_partner'
  ORDER BY dps.start_date DESC
  LIMIT 1;

  -- إذا لم يكن هناك اشتراك فعال
  IF NOT v_subscription_active THEN
    RETURN FALSE;
  END IF;

  -- عد الطلبات الحالية اليوم
  SELECT COUNT(*) INTO v_current_orders
  FROM public.deliveries
  WHERE delivery_partner_id = (SELECT user_id FROM public.delivery_partners WHERE id = p_partner_id)
    AND created_at >= CURRENT_DATE;

  RETURN v_current_orders < v_max_orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_accept_order IS 'التحقق مما إذا كان السائق يمكنه قبول طلب جديد';

-- دالة إنشاء اشتراك جديد للسائق
CREATE OR REPLACE FUNCTION public.create_delivery_subscription(
  p_partner_id UUID,
  p_plan_id UUID,
  p_payment_provider TEXT DEFAULT NULL,
  p_payment_intent_id TEXT DEFAULT NULL,
  p_amount_paid DECIMAL DEFAULT NULL,
  p_trial_days INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_plan RECORD;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- الحصول على معلومات الخطة
  SELECT * INTO v_plan FROM public.delivery_subscription_plans WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription plan not found';
  END IF;

  -- حساب تاريخ الانتهاء
  IF v_plan.billing_period = 'yearly' THEN
    v_end_date := NOW() + INTERVAL '1 year';
  ELSIF v_plan.billing_period = 'lifetime' THEN
    v_end_date := NULL;
  ELSE
    v_end_date := NOW() + INTERVAL '1 month';
  END IF;

  -- إلغاء الاشتراكات السابقة النشطة
  UPDATE public.delivery_partner_subscriptions
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE delivery_partner_id = p_partner_id
    AND status = 'active';

  -- إنشاء الاشتراك الجديد
  INSERT INTO public.delivery_partner_subscriptions (
    delivery_partner_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_provider,
    payment_intent_id,
    amount_paid,
    next_billing_date
  ) VALUES (
    p_partner_id,
    p_plan_id,
    CASE WHEN p_trial_days > 0 THEN 'trial' ELSE 'active' END,
    NOW(),
    v_end_date,
    p_payment_provider,
    p_payment_intent_id,
    p_amount_paid,
    v_end_date
  ) RETURNING id INTO v_subscription_id;

  -- إذا كانت هناك فترة تجربة، حدد تاريخ انتهائها
  IF p_trial_days > 0 THEN
    UPDATE public.delivery_partner_subscriptions
    SET trial_end_date = NOW() + (p_trial_days || ' days')::INTERVAL
    WHERE id = v_subscription_id;
  END IF;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_delivery_subscription IS 'إنشاء اشتراك جديد لموظف التوصيل';

-- دالة إلغاء اشتراك السائق
CREATE OR REPLACE FUNCTION public.cancel_delivery_subscription(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  -- التحقق من الملكية
  SELECT delivery_partner_id INTO v_partner_id
  FROM public.delivery_partner_subscriptions
  WHERE id = p_subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  IF v_partner_id != (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid())
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to cancel this subscription';
  END IF;

  UPDATE public.delivery_partner_subscriptions
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cancel_delivery_subscription IS 'إلغاء اشتراك موظف التوصيل';

-- دالة تجديد اشتراك السائق
CREATE OR REPLACE FUNCTION public.renew_delivery_subscription(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan RECORD;
  v_new_end_date TIMESTAMPTZ;
BEGIN
  -- الحصول على معلومات الخطة
  SELECT dsp.*, dps.end_date
  INTO v_plan
  FROM public.delivery_partner_subscriptions dps
  JOIN public.delivery_subscription_plans dsp ON dsp.id = dps.plan_id
  WHERE dps.id = p_subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  -- حساب تاريخ التجديد الجديد
  IF v_plan.billing_period = 'yearly' THEN
    v_new_end_date := COALESCE(v_plan.end_date, NOW()) + INTERVAL '1 year';
  ELSIF v_plan.billing_period = 'lifetime' THEN
    v_new_end_date := NULL;
  ELSE
    v_new_end_date := COALESCE(v_plan.end_date, NOW()) + INTERVAL '1 month';
  END IF;

  UPDATE public.delivery_partner_subscriptions
  SET
    status = 'active',
    end_date = v_new_end_date,
    next_billing_date = v_new_end_date,
    last_payment_date = NOW(),
    updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.renew_delivery_subscription IS 'تجديد اشتراك موظف التوصيل';

-- دالة تحديث إحصائيات السائق
CREATE OR REPLACE FUNCTION public.update_delivery_partner_stats(p_partner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.delivery_partner_subscriptions
  SET
    orders_completed_this_month = (
      SELECT COUNT(*)
      FROM public.deliveries
      WHERE delivery_partner_id = (SELECT user_id FROM public.delivery_partners WHERE id = p_partner_id)
        AND status = 'completed'
        AND created_at >= DATE_TRUNC('month', NOW())
    ),
    total_earnings = (
      SELECT COALESCE(SUM(earnings), 0)
      FROM public.deliveries
      WHERE delivery_partner_id = (SELECT user_id FROM public.delivery_partners WHERE id = p_partner_id)
        AND created_at >= DATE_TRUNC('month', NOW())
    ),
    updated_at = NOW()
  WHERE delivery_partner_id = p_partner_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_delivery_partner_stats IS 'تحديث إحصائيات موظف التوصيل الشهرية';

-- =====================================================
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

-- جدول اشتراكات التوصيل
ALTER TABLE public.delivery_partner_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_partner_subscriptions_read_own" ON public.delivery_partner_subscriptions;
CREATE POLICY "delivery_partner_subscriptions_read_own" ON public.delivery_partner_subscriptions FOR SELECT
  TO authenticated USING (
    delivery_partner_id = (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "delivery_partner_subscriptions_insert_own" ON public.delivery_partner_subscriptions;
CREATE POLICY "delivery_partner_subscriptions_insert_own" ON public.delivery_partner_subscriptions FOR INSERT
  TO authenticated WITH CHECK (
    delivery_partner_id = (SELECT id FROM public.delivery_partners WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "delivery_partner_subscriptions_admin_manage" ON public.delivery_partner_subscriptions;
CREATE POLICY "delivery_partner_subscriptions_admin_manage" ON public.delivery_partner_subscriptions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_delivery_partner_subscriptions_updated_at ON public.delivery_partner_subscriptions;
CREATE TRIGGER update_delivery_partner_subscriptions_updated_at
  BEFORE UPDATE ON public.delivery_partner_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار انتهاء اشتراك التوصيل
CREATE OR REPLACE FUNCTION notify_delivery_subscription_expiring()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date <= NOW() + INTERVAL '7 days' THEN
    PERFORM pg_notify(
      'delivery_subscription_expiring',
      json_build_object(
        'subscription_id', NEW.id,
        'delivery_partner_id', NEW.delivery_partner_id,
        'plan_id', NEW.plan_id,
        'end_date', NEW.end_date,
        'days_left', EXTRACT(DAY FROM (NEW.end_date - NOW()))
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delivery_subscription_expiring_trigger ON public.delivery_partner_subscriptions;
CREATE TRIGGER delivery_subscription_expiring_trigger
  AFTER UPDATE ON public.delivery_partner_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_subscription_expiring();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على:
--    - 04_roles_permissions_system.sql
--    - 01_delivery_subscription_plans.sql (الخطط)
--    - 07_delivery_partners (جدول موظفي التوصيل)
-- 2. الأسعار بالدولار فقط (USD)
-- 3. الخطة المجانية: 3 طلبات/يوم، عمولة 15%
-- 4. الخطة الفضية: $19/شهر - 10 طلبات/يوم، عمولة 10%
-- 5. الخطة الذهبية: $49/شهر - طلبات غير محدودة، عمولة 5%
