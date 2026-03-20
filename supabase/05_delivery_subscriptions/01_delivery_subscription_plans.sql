-- =====================================================
-- Marketna E-Commerce - Delivery Partner Subscription Plans Schema
-- File: 01_delivery_subscription_plans.sql
-- Description: جدول خطط اشتراكات موظفي التوصيل
-- Dependency: يجب تشغيل 04_roles_permissions_system.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول خطط اشتراكات التوصيل (Delivery Partner Subscription Plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_type TEXT DEFAULT 'delivery_partner' CHECK (plan_type IN ('seller', 'delivery_partner')),  -- نوع الخطة
  name TEXT NOT NULL,              -- اسم الخطة: Free, Silver, Gold
  name_ar TEXT,                           -- الاسم بالعربي
  description TEXT,                       -- وصف الخطة
  description_ar TEXT,                    -- الوصف بالعربي

  -- التسعير
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,  -- السعر بالدولار

  -- حدود الخطة (للتوصيل)
  max_orders_per_day INTEGER NOT NULL DEFAULT 3,        -- الحد الأقصى للطلبات يومياً
  max_orders_per_month INTEGER DEFAULT NULL,            -- الحد الأقصى للطلبات شهرياً (NULL = غير محدود)
  commission_rate DECIMAL(5,2) DEFAULT 15.00,           -- نسبة العمولة (%)

  -- مناطق التغطية
  max_coverage_zones INTEGER DEFAULT 1,                 -- الحد الأقصى لمناطق التغطية
  priority_delivery BOOLEAN DEFAULT FALSE,              -- أولوية الحصول على الطلبات

  -- الميزات
  features JSONB DEFAULT '[]'::jsonb,     -- قائمة الميزات
  features_ar JSONB DEFAULT '[]'::jsonb,  -- الميزات بالعربي

  -- إعدادات الخطة
  is_active BOOLEAN DEFAULT TRUE,         -- هل الخطة متاحة للتسجيل؟
  is_popular BOOLEAN DEFAULT FALSE,       -- هل هي الخطة الأكثر شعبية؟
  sort_order INTEGER DEFAULT 0,           -- ترتيب العرض

  -- الفترة
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  trial_days INTEGER DEFAULT 0,           -- أيام التجربة المجانية

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- قيود الفهرسة
  UNIQUE(plan_type, name)
);

COMMENT ON TABLE public.delivery_subscription_plans IS 'خطط اشتراكات موظفي التوصيل';
COMMENT ON COLUMN public.delivery_subscription_plans.plan_type IS 'نوع الخطة: seller, delivery_partner';
COMMENT ON COLUMN public.delivery_subscription_plans.price_usd IS 'السعر بالدولار الأمريكي';
COMMENT ON COLUMN public.delivery_subscription_plans.max_orders_per_day IS 'الحد الأقصى للطلبات يومياً';
COMMENT ON COLUMN public.delivery_subscription_plans.commission_rate IS 'نسبة العمولة (%)';
COMMENT ON COLUMN public.delivery_subscription_plans.billing_period IS 'فترة الفوترة: monthly, yearly, lifetime';

-- =====================================================
-- 2. جدول اشتراكات التوصيل (Delivery Partner Subscriptions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_partner_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.delivery_subscription_plans(id),

  -- حالة الاشتراك
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),

  -- التواريخ
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,                   -- تاريخ الانتهاء (NULL = دائم)
  trial_end_date TIMESTAMPTZ,             -- نهاية فترة التجربة
  cancelled_at TIMESTAMPTZ,               -- تاريخ الإلغاء

  -- الدفع
  payment_provider TEXT,                  -- مزود الدفع: stripe, paypal, manual
  payment_intent_id TEXT,                 -- معرف عملية الدفع
  last_payment_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,          -- تاريخ الفوترة القادم

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
-- 3. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_active ON public.delivery_subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_order ON public.delivery_subscription_plans(sort_order);
CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_type ON public.delivery_subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_partner ON public.delivery_partner_subscriptions(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_plan ON public.delivery_partner_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_status ON public.delivery_partner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_delivery_partner_subscriptions_end_date ON public.delivery_partner_subscriptions(end_date);

-- =====================================================
-- 4. البيانات الافتراضية (خطط اشتراك التوصيل)
-- =====================================================

-- الخطة المجانية (Free) - للسائقين الجدد
INSERT INTO public.delivery_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_orders_per_day, commission_rate, features, features_ar, is_active, billing_period, trial_days, sort_order) VALUES
  ('delivery_partner', 'free', 'مجانية', 'خطة أساسية لسائقي التوصيل الجدد', 'خطة أساسية لسائقي التوصيل الجدد', 0, 3, 15.00,
   '["3 orders/day", "15% commission", "Basic support"]'::jsonb,
   '["3 طلبات/يوم", "عمولة 15%", "دعم أساسي"]'::jsonb,
   TRUE, 'monthly', 7, 1)
ON CONFLICT (plan_type, name) DO NOTHING;

-- الخطة الفضية (Silver) - للسائقين النشطين
INSERT INTO public.delivery_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_orders_per_day, commission_rate, features, features_ar, is_active, is_popular, billing_period, sort_order) VALUES
  ('delivery_partner', 'silver', 'فضية', 'خطة متقدمة لسائقي التوصيل النشطين', 'خطة متقدمة لسائقي التوصيل النشطين', 19, 10, 10.00,
   '["10 orders/day", "10% commission", "Priority support", "2 coverage zones"]'::jsonb,
   '["10 طلبات/يوم", "عمولة 10%", "دعم أولوي", "منطقتي تغطية"]'::jsonb,
   TRUE, TRUE, 'monthly', 2)
ON CONFLICT (plan_type, name) DO NOTHING;

-- الخطة الذهبية (Gold) - للسائقين المحترفين
INSERT INTO public.delivery_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_orders_per_day, commission_rate, features, features_ar, is_active, billing_period, sort_order) VALUES
  ('delivery_partner', 'gold', 'ذهبية', 'خطة احترافية لسائقي التوصيل المحترفين', 'خطة احترافية لسائقي التوصيل المحترفين', 49, 999, 5.00,
   '["Unlimited orders", "5% commission", "24/7 support", "All zones", "Priority orders"]'::jsonb,
   '["طلبات غير محدودة", "عمولة 5%", "دعم 24/7", "كل المناطق", "أولوية الطلبات"]'::jsonb,
   TRUE, 'monthly', 3)
ON CONFLICT (plan_type, name) DO NOTHING;

-- =====================================================
-- 5. دوال إدارة اشتراكات التوصيل (Management Functions)
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
-- 6. سياسات الأمان (Row Level Security)
-- =====================================================

-- جدول خطط اشتراكات التوصيل
ALTER TABLE public.delivery_subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_subscription_plans_public_read" ON public.delivery_subscription_plans;
CREATE POLICY "delivery_subscription_plans_public_read" ON public.delivery_subscription_plans FOR SELECT
  TO authenticated USING (is_active = TRUE AND plan_type = 'delivery_partner');

DROP POLICY IF EXISTS "delivery_subscription_plans_admin_manage" ON public.delivery_subscription_plans;
CREATE POLICY "delivery_subscription_plans_admin_manage" ON public.delivery_subscription_plans FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

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
-- 7. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_delivery_subscription_plans_updated_at ON public.delivery_subscription_plans;
CREATE TRIGGER update_delivery_subscription_plans_updated_at
  BEFORE UPDATE ON public.delivery_subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_partner_subscriptions_updated_at ON public.delivery_partner_subscriptions;
CREATE TRIGGER update_delivery_partner_subscriptions_updated_at
  BEFORE UPDATE ON public.delivery_partner_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. إشعارات قاعدة البيانات (Database Notifications)
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
-- 1. هذا الملف يعتمد على 04_roles_permissions_system.sql
-- 2. الأسعار بالدولار فقط (USD)
-- 3. الخطة المجانية: 3 طلبات/يوم، عمولة 15%
-- 4. الخطة الفضية: $19/شهر - 10 طلبات/يوم، عمولة 10%
-- 5. الخطة الذهبية: $49/شهر - طلبات غير محدودة، عمولة 5%
-- 6. جدول delivery_partners مطلوب لاستخدام دوال الاشتراكات
-- 7. اشتراكات الباعة في ملف منفصل (04_seller_subscriptions)
