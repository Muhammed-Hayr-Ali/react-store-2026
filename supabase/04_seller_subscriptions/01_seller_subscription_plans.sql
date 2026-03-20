-- =====================================================
-- Marketna E-Commerce - Seller Subscription Plans Schema
-- File: 01_seller_subscription_plans.sql
-- Description: جدول خطط اشتراكات الباعة
-- Dependency: يجب تشغيل 04_roles_permissions_system.sql أولاً
-- =====================================================

-- =====================================================
-- 1. جدول خطط اشتراكات الباعة (Seller Subscription Plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_type TEXT DEFAULT 'seller' CHECK (plan_type IN ('seller', 'delivery_partner')),  -- نوع الخطة
  name TEXT NOT NULL,              -- اسم الخطة: Free, Silver, Gold
  name_ar TEXT,                           -- الاسم بالعربي
  description TEXT,                       -- وصف الخطة
  description_ar TEXT,                    -- الوصف بالعربي

  -- التسعير
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,  -- السعر بالدولار

  -- حدود الخطة (للباعة)
  max_products INTEGER NOT NULL DEFAULT 50,        -- الحد الأقصى للمنتجات
  max_categories INTEGER DEFAULT NULL,             -- الحد الأقصى للأقسام (NULL = غير محدود)
  max_images_per_product INTEGER DEFAULT 5,        -- الحد الأقصى للصور لكل منتج

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

COMMENT ON TABLE public.seller_subscription_plans IS 'خطط اشتراكات الباعة';
COMMENT ON COLUMN public.seller_subscription_plans.plan_type IS 'نوع الخطة: seller, delivery_partner';
COMMENT ON COLUMN public.seller_subscription_plans.price_usd IS 'السعر بالدولار الأمريكي';
COMMENT ON COLUMN public.seller_subscription_plans.max_products IS 'الحد الأقصى لعدد المنتجات المسموح بها';
COMMENT ON COLUMN public.seller_subscription_plans.billing_period IS 'فترة الفوترة: monthly, yearly, lifetime';

-- =====================================================
-- 2. جدول اشتراكات الباعة (Seller Subscriptions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.seller_subscription_plans(id),

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

  -- ملاحظات
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.seller_subscriptions IS 'اشتراكات الباعة الفعلية';
COMMENT ON COLUMN public.seller_subscriptions.status IS 'حالة الاشتراك: active, expired, cancelled, pending, trial';
COMMENT ON COLUMN public.seller_subscriptions.payment_provider IS 'مزود الدفع: stripe, paypal, manual';

-- =====================================================
-- 3. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_active ON public.seller_subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_order ON public.seller_subscription_plans(sort_order);
CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_type ON public.seller_subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_seller ON public.seller_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_plan ON public.seller_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_status ON public.seller_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_end_date ON public.seller_subscriptions(end_date);

-- =====================================================
-- 4. البيانات الافتراضية (خطط اشتراك الباعة)
-- =====================================================

-- الخطة المجانية (Free)
INSERT INTO public.seller_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_products, features, features_ar, is_active, billing_period, trial_days, sort_order) VALUES
  ('seller', 'free', 'مجانية', 'خطة أساسية للباعة الجدد', 'خطة أساسية للباعة الجدد', 0, 50,
   '["50 products", "Basic dashboard", "Email support"]'::jsonb,
   '["50 منتج", "لوحة تحكم أساسية", "دعم عبر البريد"]'::jsonb,
   TRUE, 'monthly', 14, 1)
ON CONFLICT (plan_type, name) DO NOTHING;

-- الخطة الفضية (Silver)
INSERT INTO public.seller_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_products, features, features_ar, is_active, is_popular, billing_period, sort_order) VALUES
  ('seller', 'silver', 'فضية', 'خطة متقدمة للباعة النشطين', 'خطة متقدمة للباعة النشطين', 29, 200,
   '["200 products", "Advanced analytics", "Priority support", "Custom domain"]'::jsonb,
   '["200 منتج", "إحصائيات متقدمة", "دعم أولوي", "نطاق مخصص"]'::jsonb,
   TRUE, TRUE, 'monthly', 2)
ON CONFLICT (plan_type, name) DO NOTHING;

-- الخطة الذهبية (Gold)
INSERT INTO public.seller_subscription_plans (plan_type, name, name_ar, description, description_ar, price_usd, max_products, features, features_ar, is_active, billing_period, sort_order) VALUES
  ('seller', 'gold', 'ذهبية', 'خطة احترافية للباعة الكبار', 'خطة احترافية للباعة الكبار', 99, 1000,
   '["1000 products", "Full analytics", "24/7 support", "API access", "White label"]'::jsonb,
   '["1000 منتج", "إحصائيات كاملة", "دعم 24/7", "وصول API", "علامة بيضاء"]'::jsonb,
   TRUE, 'monthly', 3)
ON CONFLICT (plan_type, name) DO NOTHING;

-- =====================================================
-- 5. دوال إدارة الاشتراكات (Management Functions)
-- =====================================================

-- دالة الحصول على خطة البائع الحالية
CREATE OR REPLACE FUNCTION public.get_seller_subscription(p_seller_id UUID DEFAULT NULL)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  plan_name_ar TEXT,
  price_usd DECIMAL,
  max_products INTEGER,
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  products_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    sp.name,
    sp.name_ar,
    sp.price_usd,
    sp.max_products,
    ss.status,
    ss.start_date,
    ss.end_date,
    (SELECT COUNT(*) FROM public.products WHERE vendor_id = (SELECT user_id FROM public.sellers WHERE id = p_seller_id))
  FROM public.seller_subscriptions ss
  JOIN public.seller_subscription_plans sp ON sp.id = ss.plan_id
  WHERE ss.seller_id = COALESCE(p_seller_id, (SELECT id FROM public.sellers WHERE user_id = auth.uid()))
    AND ss.status = 'active'
    AND sp.plan_type = 'seller'
  ORDER BY ss.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_seller_subscription IS 'الحصول على اشتراك البائع الحالي';

-- دالة التحقق من حد المنتجات
CREATE OR REPLACE FUNCTION public.can_add_product(p_seller_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_products INTEGER;
  v_current_products BIGINT;
  v_subscription_active BOOLEAN;
BEGIN
  -- الحصول على حد المنتجات من الاشتراك الحالي
  SELECT sp.max_products,
         EXISTS(SELECT 1 FROM public.seller_subscriptions WHERE seller_id = p_seller_id AND status = 'active')
  INTO v_max_products, v_subscription_active
  FROM public.seller_subscriptions ss
  JOIN public.seller_subscription_plans sp ON sp.id = ss.plan_id
  WHERE ss.seller_id = COALESCE(p_seller_id, (SELECT id FROM public.sellers WHERE user_id = auth.uid()))
    AND ss.status = 'active'
    AND sp.plan_type = 'seller'
  ORDER BY ss.start_date DESC
  LIMIT 1;

  -- إذا لم يكن هناك اشتراك فعال
  IF NOT v_subscription_active THEN
    RETURN FALSE;
  END IF;

  -- عد المنتجات الحالية
  SELECT COUNT(*) INTO v_current_products
  FROM public.products
  WHERE vendor_id = (SELECT user_id FROM public.sellers WHERE id = p_seller_id);

  RETURN v_current_products < v_max_products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_add_product IS 'التحقق مما إذا كان البائع يمكنه إضافة منتج جديد';

-- دالة إنشاء اشتراك جديد للبائع
CREATE OR REPLACE FUNCTION public.create_seller_subscription(
  p_seller_id UUID,
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
  SELECT * INTO v_plan FROM public.seller_subscription_plans WHERE id = p_plan_id;

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
  UPDATE public.seller_subscriptions
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE seller_id = p_seller_id
    AND status = 'active';

  -- إنشاء الاشتراك الجديد
  INSERT INTO public.seller_subscriptions (
    seller_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_provider,
    payment_intent_id,
    amount_paid,
    next_billing_date
  ) VALUES (
    p_seller_id,
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
    UPDATE public.seller_subscriptions
    SET trial_end_date = NOW() + (p_trial_days || ' days')::INTERVAL
    WHERE id = v_subscription_id;
  END IF;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_seller_subscription IS 'إنشاء اشتراك جديد للبائع';

-- دالة إلغاء اشتراك
CREATE OR REPLACE FUNCTION public.cancel_seller_subscription(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  -- التحقق من الملكية
  SELECT seller_id INTO v_seller_id 
  FROM public.seller_subscriptions 
  WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  IF v_seller_id != (SELECT id FROM public.sellers WHERE user_id = auth.uid()) 
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to cancel this subscription';
  END IF;
  
  UPDATE public.seller_subscriptions
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_subscription_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cancel_seller_subscription IS 'إلغاء اشتراك البائع';

-- دالة تجديد الاشتراك
CREATE OR REPLACE FUNCTION public.renew_seller_subscription(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan RECORD;
  v_new_end_date TIMESTAMPTZ;
BEGIN
  -- الحصول على معلومات الخطة
  SELECT sp.*, ss.end_date
  INTO v_plan
  FROM public.seller_subscriptions ss
  JOIN public.subscription_plans sp ON sp.id = ss.plan_id
  WHERE ss.id = p_subscription_id;
  
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
  
  UPDATE public.seller_subscriptions
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

COMMENT ON FUNCTION public.renew_seller_subscription IS 'تجديد اشتراك البائع';

-- =====================================================
-- 6. سياسات الأمان (Row Level Security)
-- =====================================================

-- جدول خطط اشتراكات الباعة
ALTER TABLE public.seller_subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_subscription_plans_public_read" ON public.seller_subscription_plans;
CREATE POLICY "seller_subscription_plans_public_read" ON public.seller_subscription_plans FOR SELECT
  TO authenticated USING (is_active = TRUE AND plan_type = 'seller');

DROP POLICY IF EXISTS "seller_subscription_plans_admin_manage" ON public.seller_subscription_plans;
CREATE POLICY "seller_subscription_plans_admin_manage" ON public.seller_subscription_plans FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- جدول اشتراكات الباعة
ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_subscriptions_read_own" ON public.seller_subscriptions;
CREATE POLICY "seller_subscriptions_read_own" ON public.seller_subscriptions FOR SELECT
  TO authenticated USING (
    seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "seller_subscriptions_insert_own" ON public.seller_subscriptions;
CREATE POLICY "seller_subscriptions_insert_own" ON public.seller_subscriptions FOR INSERT
  TO authenticated WITH CHECK (
    seller_id = (SELECT id FROM public.sellers WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "seller_subscriptions_admin_manage" ON public.seller_subscriptions;
CREATE POLICY "seller_subscriptions_admin_manage" ON public.seller_subscriptions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 7. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_seller_subscription_plans_updated_at ON public.seller_subscription_plans;
CREATE TRIGGER update_seller_subscription_plans_updated_at
  BEFORE UPDATE ON public.seller_subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seller_subscriptions_updated_at ON public.seller_subscriptions;
CREATE TRIGGER update_seller_subscriptions_updated_at
  BEFORE UPDATE ON public.seller_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. إشعارات قاعدة البيانات (Database Notifications)
-- =====================================================

-- دالة إشعار انتهاء الاشتراك
CREATE OR REPLACE FUNCTION notify_subscription_expiring()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date <= NOW() + INTERVAL '7 days' THEN
    PERFORM pg_notify(
      'subscription_expiring',
      json_build_object(
        'subscription_id', NEW.id,
        'seller_id', NEW.seller_id,
        'plan_id', NEW.plan_id,
        'end_date', NEW.end_date,
        'days_left', EXTRACT(DAY FROM (NEW.end_date - NOW()))
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscription_expiring_trigger ON public.seller_subscriptions;
CREATE TRIGGER subscription_expiring_trigger
  AFTER UPDATE ON public.seller_subscriptions
  FOR EACH ROW EXECUTE FUNCTION notify_subscription_expiring();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 04_roles_permissions_system.sql
-- 2. الأسعار بالدولار فقط (USD)
-- 3. الخطة المجانية: 50 منتج
-- 4. الخطة الفضية: $29/شهر - 200 منتج
-- 5. الخطة الذهبية: $99/شهر - 1000 منتج
-- 6. جدول الباعة مطلوب لاستخدام دوال الاشتراكات (06_sellers)
-- 7. اشتراكات التوصيل في ملف منفصل (05_delivery_subscriptions)
