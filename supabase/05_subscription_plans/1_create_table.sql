-- =====================================================
-- Marketna E-Commerce - Subscription Plans Definitions
-- File: 05_subscriptions.sql
-- Version: 3.1 (Final with minor improvements)
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
-- 5. RLS Policies (safe - no dependencies)
-- 6. Default Data (8 plans across 3 categories)
-- 7. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

-- Drop policies first
DROP POLICY IF EXISTS "plans_public_read" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_read_all" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_manage" ON public.plans;

-- Drop indexes
DROP INDEX IF EXISTS idx_plans_category;
DROP INDEX IF EXISTS idx_plans_permissions;

-- Drop table and type
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

COMMENT ON INDEX idx_plans_category IS 'Fast search by plan category';
COMMENT ON INDEX idx_plans_permissions IS 'Search inside JSONB permissions';


-- =====================================================
-- 5️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Public read (safe - no dependencies)
-- =====================================================
CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT TO authenticated, anon
  USING (true);

-- ⚠️ Policy 2 & 3: Admin policies created in 05b_plans_rls_policies.sql
-- (after profile_roles table exists)


-- =====================================================
-- 6️⃣ DEFAULT DATA
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
-- 7️⃣ VERIFICATION
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
