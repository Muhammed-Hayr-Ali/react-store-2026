-- =====================================================
-- Marketna E-Commerce - Delivery Partner Subscription Plans Schema
-- File: 01_delivery_subscription_plans.sql
-- Description: جدول خطط اشتراكات موظفي التوصيل (فقط الخطط)
-- Dependency: يجب تشغيل 04_roles_permissions_system.sql أولاً
-- Note: جدول delivery_partner_subscriptions تم نقله لملف منفصل
-- =====================================================

-- =====================================================
-- 1. جدول خطط اشتراكات التوصيل (Delivery Subscription Plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.delivery_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_type TEXT DEFAULT 'delivery_partner' CHECK (plan_type = ANY (ARRAY['seller', 'delivery_partner'])),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,

  -- التسعير
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- حدود الخطة (للتوصيل)
  max_orders_per_day INTEGER NOT NULL DEFAULT 3,
  max_orders_per_month INTEGER DEFAULT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,

  -- مناطق التغطية
  max_coverage_zones INTEGER DEFAULT 1,
  priority_delivery BOOLEAN DEFAULT FALSE,

  -- الميزات
  features JSONB DEFAULT '[]'::jsonb,
  features_ar JSONB DEFAULT '[]'::jsonb,

  -- إعدادات الخطة
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- الفترة
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period = ANY (ARRAY['monthly', 'yearly', 'lifetime'])),
  trial_days INTEGER DEFAULT 0,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(plan_type, name)
);

COMMENT ON TABLE public.delivery_subscription_plans IS 'خطط اشتراكات موظفي التوصيل';
COMMENT ON COLUMN public.delivery_subscription_plans.plan_type IS 'نوع الخطة: seller, delivery_partner';
COMMENT ON COLUMN public.delivery_subscription_plans.price_usd IS 'السعر بالدولار الأمريكي';
COMMENT ON COLUMN public.delivery_subscription_plans.max_orders_per_day IS 'الحد الأقصى للطلبات يومياً';
COMMENT ON COLUMN public.delivery_subscription_plans.commission_rate IS 'نسبة العمولة (%)';
COMMENT ON COLUMN public.delivery_subscription_plans.billing_period IS 'فترة الفوترة: monthly, yearly, lifetime';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_active ON public.delivery_subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_order ON public.delivery_subscription_plans(sort_order);
CREATE INDEX IF NOT EXISTS idx_delivery_subscription_plans_type ON public.delivery_subscription_plans(plan_type);

-- =====================================================
-- 3. البيانات الافتراضية (خطط اشتراك التوصيل)
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
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.delivery_subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_subscription_plans_public_read" ON public.delivery_subscription_plans;
CREATE POLICY "delivery_subscription_plans_public_read" ON public.delivery_subscription_plans FOR SELECT
  TO authenticated USING (is_active = TRUE AND plan_type = 'delivery_partner');

DROP POLICY IF EXISTS "delivery_subscription_plans_admin_manage" ON public.delivery_subscription_plans;
CREATE POLICY "delivery_subscription_plans_admin_manage" ON public.delivery_subscription_plans FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_delivery_subscription_plans_updated_at ON public.delivery_subscription_plans;
CREATE TRIGGER update_delivery_subscription_plans_updated_at
  BEFORE UPDATE ON public.delivery_subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 04_roles_permissions_system.sql
-- 2. الأسعار بالدولار فقط (USD)
-- 3. الخطة المجانية: 3 طلبات/يوم، عمولة 15%
-- 4. الخطة الفضية: $19/شهر - 10 طلبات/يوم، عمولة 10%
-- 5. الخطة الذهبية: $49/شهر - طلبات غير محدودة، عمولة 5%
-- 6. جدول delivery_partner_subscriptions في ملف منفصل (02_delivery_partner_subscriptions.sql)
-- 7. يجب تشغيل جدول delivery_partners قبل جدول الاشتراكات
