-- =====================================================
-- Marketna E-Commerce - Seller Subscription Plans Schema
-- File: 01_seller_subscription_plans.sql
-- Description: جدول خطط اشتراكات الباعة (فقط الخطط)
-- Dependency: يجب تشغيل 04_roles_permissions_system.sql أولاً
-- Note: جدول seller_subscriptions تم نقله لملف منفصل (02_seller_subscriptions.sql)
-- =====================================================

-- =====================================================
-- 1. جدول خطط اشتراكات الباعة (Seller Subscription Plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seller_subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_type TEXT DEFAULT 'seller' CHECK (plan_type IN ('seller', 'delivery_partner')),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,

  -- التسعير
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- حدود الخطة (للباعة)
  max_products INTEGER NOT NULL DEFAULT 50,
  max_categories INTEGER DEFAULT NULL,
  max_images_per_product INTEGER DEFAULT 5,

  -- الميزات
  features JSONB DEFAULT '[]'::jsonb,
  features_ar JSONB DEFAULT '[]'::jsonb,

  -- إعدادات الخطة
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- الفترة
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  trial_days INTEGER DEFAULT 0,

  -- طوابع زمنية
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(plan_type, name)
);

COMMENT ON TABLE public.seller_subscription_plans IS 'خطط اشتراكات الباعة';
COMMENT ON COLUMN public.seller_subscription_plans.plan_type IS 'نوع الخطة: seller, delivery_partner';
COMMENT ON COLUMN public.seller_subscription_plans.price_usd IS 'السعر بالدولار الأمريكي';
COMMENT ON COLUMN public.seller_subscription_plans.max_products IS 'الحد الأقصى لعدد المنتجات المسموح بها';
COMMENT ON COLUMN public.seller_subscription_plans.billing_period IS 'فترة الفوترة: monthly, yearly, lifetime';

-- =====================================================
-- 2. الفهرسة (Indexing)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_active ON public.seller_subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_order ON public.seller_subscription_plans(sort_order);
CREATE INDEX IF NOT EXISTS idx_seller_subscription_plans_type ON public.seller_subscription_plans(plan_type);

-- =====================================================
-- 3. البيانات الافتراضية (خطط اشتراك الباعة)
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
-- 4. سياسات الأمان (Row Level Security)
-- =====================================================

ALTER TABLE public.seller_subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_subscription_plans_public_read" ON public.seller_subscription_plans;
CREATE POLICY "seller_subscription_plans_public_read" ON public.seller_subscription_plans FOR SELECT
  TO authenticated USING (is_active = TRUE AND plan_type = 'seller');

DROP POLICY IF EXISTS "seller_subscription_plans_admin_manage" ON public.seller_subscription_plans;
CREATE POLICY "seller_subscription_plans_admin_manage" ON public.seller_subscription_plans FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =====================================================
-- 5. مشغلات التحديث التلقائي (Auto Update Triggers)
-- =====================================================

DROP TRIGGER IF EXISTS update_seller_subscription_plans_updated_at ON public.seller_subscription_plans;
CREATE TRIGGER update_seller_subscription_plans_updated_at
  BEFORE UPDATE ON public.seller_subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. هذا الملف يعتمد على 04_roles_permissions_system.sql
-- 2. الأسعار بالدولار فقط (USD)
-- 3. الخطة المجانية: 50 منتج
-- 4. الخطة الفضية: $29/شهر - 200 منتج
-- 5. الخطة الذهبية: $99/شهر - 1000 منتج
-- 6. جدول seller_subscriptions في ملف منفصل (02_seller_subscriptions.sql)
-- 7. يجب تشغيل 06_sellers_schema.sql قبل جدول الاشتراكات
