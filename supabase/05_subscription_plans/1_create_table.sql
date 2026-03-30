-- =====================================================
-- Marketna E-Commerce - Subscription Plans Definitions
-- File: 05_subscriptions.sql
-- Version: 3.3 (Final Audited - Phase 1)
-- Date: 2026-03-22
-- Description: Subscription plans definition table with category ENUM
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create ENUM for plan categories
-- 3. Create plans table
-- 4. Indexes
-- 5. RLS Policies (Phase 1 only)
-- 6. Trigger for updated_at
-- 7. Default Data
-- 8. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP POLICY IF EXISTS "plans_public_read" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_read_all" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_manage" ON public.plans;

DROP TRIGGER IF EXISTS plans_updated_at_trigger ON public.plans;
DROP FUNCTION IF EXISTS public.update_plans_updated_at() CASCADE;

DROP INDEX IF EXISTS idx_plans_category;
DROP INDEX IF EXISTS idx_plans_permissions;
DROP INDEX IF EXISTS idx_plans_is_default;
DROP INDEX IF EXISTS idx_plans_is_popular;
DROP INDEX IF EXISTS idx_plans_created_at;

DROP TABLE IF EXISTS public.plans CASCADE;
DROP TYPE IF EXISTS public.plan_category CASCADE;


-- =====================================================
-- 2️⃣ CREATE ENUM
-- =====================================================

CREATE TYPE public.plan_category AS ENUM ('seller', 'delivery', 'customer');

COMMENT ON TYPE public.plan_category IS 'Available subscription plan categories';


-- =====================================================
-- 3️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     plan_category NOT NULL,
  name         TEXT NOT NULL,
  price        NUMERIC NOT NULL DEFAULT 0,
  billing_period TEXT DEFAULT 'yearly',
  permissions  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default   BOOLEAN DEFAULT FALSE,
  is_popular   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_category_name UNIQUE (category, name)
);

-- Comments
COMMENT ON TABLE public.plans IS 'Subscription plans definition table - permission templates for each category';
COMMENT ON COLUMN public.plans.id IS 'Unique identifier for the plan';
COMMENT ON COLUMN public.plans.category IS 'Plan category: seller, delivery, customer';
COMMENT ON COLUMN public.plans.name IS 'Plan name';
COMMENT ON COLUMN public.plans.price IS 'Plan price';
COMMENT ON COLUMN public.plans.billing_period IS 'Billing period';
COMMENT ON COLUMN public.plans.permissions IS 'Plan permissions in JSONB format';
COMMENT ON COLUMN public.plans.is_default IS 'Whether this plan is default';
COMMENT ON COLUMN public.plans.is_popular IS 'Whether this plan is popular';
COMMENT ON COLUMN public.plans.created_at IS 'Plan creation timestamp';
COMMENT ON COLUMN public.plans.updated_at IS 'Plan last update timestamp';


-- =====================================================
-- 4️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_plans_category ON public.plans(category);
CREATE INDEX idx_plans_permissions ON public.plans USING GIN(permissions);
CREATE INDEX idx_plans_is_default ON public.plans(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_plans_is_popular ON public.plans(is_popular) WHERE is_popular = TRUE;
CREATE INDEX idx_plans_created_at ON public.plans(created_at DESC);

COMMENT ON INDEX idx_plans_category IS 'Fast search by plan category';
COMMENT ON INDEX idx_plans_permissions IS 'Search inside JSONB permissions';
COMMENT ON INDEX idx_plans_is_default IS 'Find default plan quickly';
COMMENT ON INDEX idx_plans_is_popular IS 'Find popular plans quickly';
COMMENT ON INDEX idx_plans_created_at IS 'Order plans by creation date';


-- =====================================================
-- 5️⃣ ROW LEVEL SECURITY (RLS) - Phase 1 Only
-- =====================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Public read (plans are public information)
-- =====================================================
CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT TO authenticated, anon
  USING (true);

COMMENT ON POLICY "plans_public_read" ON public.plans 
  IS 'Plans are publicly readable (marketing pages)';

-- 🔹 سياسات Admin مؤجلة لـ Phase 2 (12_profile_plans_admin_policies.sql)


-- =====================================================
-- 6️⃣ TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at_trigger
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plans_updated_at();


-- =====================================================
-- 7️⃣ DEFAULT DATA
-- =====================================================

-- =====================================================
-- Seller Plans (4 plans)
-- =====================================================
INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('seller', 'Free Seller', 0, 'lifetime',
 '{"products:create": true, "products:update": true, "products:delete": false, "orders:view": true}'::jsonb,
 true, false),

('seller', 'Starter Seller', 29.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true}'::jsonb,
 false, false),

('seller', 'Professional Seller', 59.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "analytics:view": true}'::jsonb,
 false, true),

('seller', 'Enterprise Seller', 99.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "api:access": true}'::jsonb,
 false, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular,
    updated_at = NOW();

-- =====================================================
-- Delivery Partner Plans (3 plans)
-- =====================================================
INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('delivery', 'Free Delivery Partner', 0, 'lifetime',
 '{"deliveries:accept": true, "deliveries:track": true, "earnings:view": true}'::jsonb,
 true, false),

('delivery', 'Starter Delivery Partner', 29.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true}'::jsonb,
 false, false),

('delivery', 'Professional Delivery Partner', 49.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true, "earnings:export": true}'::jsonb,
 false, true)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular,
    updated_at = NOW();

-- =====================================================
-- Customer Plans (1 plan)
-- =====================================================
INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('customer', 'Free Member', 0, 'lifetime',
 '{"orders:create": true, "reviews:write": true, "wishlist:manage": true, "tracking:view": true}'::jsonb,
 true, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular,
    updated_at = NOW();


-- =====================================================
-- 8️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Plans table created successfully!' AS status,
  COUNT(*) AS total_plans,
  COUNT(*) FILTER (WHERE category = 'seller') AS seller_plans,
  COUNT(*) FILTER (WHERE category = 'delivery') AS delivery_plans,
  COUNT(*) FILTER (WHERE category = 'customer') AS customer_plans,
  COUNT(*) FILTER (WHERE is_default = true) AS default_plans,
  COUNT(*) FILTER (WHERE is_popular = true) AS popular_plans
FROM public.plans;


-- =====================================================
-- 9️⃣ PHASE 2 REMINDER
-- =====================================================
/*
📋 PHASE 2 - Admin Policies (Execute after all tables are created):

File: 12_plans_admin_policies.sql

CREATE POLICY "plans_admin_read_all"
  ON public.plans FOR SELECT TO authenticated
  USING (public.check_user_has_role('admin'));

CREATE POLICY "plans_admin_manage"
  ON public.plans FOR ALL TO authenticated
  USING (public.check_user_has_role('admin'))
  WITH CHECK (public.check_user_has_role('admin'));
*/