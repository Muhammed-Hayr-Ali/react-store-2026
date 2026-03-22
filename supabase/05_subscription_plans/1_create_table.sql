-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Definitions
-- File: 05_subscriptions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Subscription plans definition table - with category ENUM
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create ENUM for plan categories
-- 3. Create plans definition table
-- 4. Indexes
-- =====================================================


-- =====================================================
-- 1️⃣ Create ENUM for Plan Categories
-- =====================================================

CREATE TYPE plan_category AS ENUM ('seller', 'delivery', 'customer');

COMMENT ON TYPE plan_category IS 'Available subscription plan categories in the system';


-- =====================================================
-- 2️⃣ Create Plans Definition Table
-- =====================================================

CREATE TABLE public.plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     plan_category NOT NULL,
  name         TEXT NOT NULL,
  price        NUMERIC NOT NULL DEFAULT 0,
  billing_period TEXT DEFAULT 'yearly',
  permissions  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default   BOOLEAN DEFAULT false,
  is_popular   BOOLEAN DEFAULT false,

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


-- =====================================================
-- 3️⃣ Indexes
-- =====================================================

CREATE INDEX idx_plans_category ON public.plans(category);
CREATE INDEX idx_plans_permissions ON public.plans USING GIN(permissions);

COMMENT ON INDEX idx_plans_category IS 'Fast search by plan category';
COMMENT ON INDEX idx_plans_permissions IS 'Search inside JSONB permissions array';


-- =====================================================
-- ✅ End of File
-- =====================================================
