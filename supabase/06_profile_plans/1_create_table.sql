-- Table Creation File

-- =====================================================
-- Marketna E-Commerce - Profile Plans Link Table
-- File: 06_profile_plans_links.sql
-- Version: 2.0
-- Date: 2026-03-22
-- Description: Profile plans linking table - corrected and compatible
-- Dependencies: public.profiles, public.plans
-- Links: user_id → profiles.id, plan_id → plans.id
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create profile plans link table
-- 3. Indexes
-- 4. Security (RLS)
-- =====================================================


-- =====================================================
-- 1️⃣ Create Profile Plans Link Table
-- =====================================================

CREATE TABLE public.profile_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  plan_id           UUID NOT NULL,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),
  start_date        TIMESTAMPTZ DEFAULT NOW(),
  end_date          TIMESTAMPTZ,
  trial_end_date    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign Keys
  CONSTRAINT profile_plans_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_plans_plan_id_fkey
    FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT,
  CONSTRAINT profile_plans_dates_check
    CHECK (end_date IS NULL OR end_date > start_date)
);

-- Comments
COMMENT ON TABLE public.profile_plans IS 'Profile plans linking table';
COMMENT ON COLUMN public.profile_plans.id IS 'Unique identifier for the record';
COMMENT ON COLUMN public.profile_plans.user_id IS 'User ID (from profiles.id)';
COMMENT ON COLUMN public.profile_plans.plan_id IS 'Plan ID (from plans.id)';
COMMENT ON COLUMN public.profile_plans.status IS 'Plan status: active, expired, cancelled, pending, trial';
COMMENT ON COLUMN public.profile_plans.start_date IS 'Plan start date';
COMMENT ON COLUMN public.profile_plans.end_date IS 'Plan end date';
COMMENT ON COLUMN public.profile_plans.trial_end_date IS 'Trial period end date';
COMMENT ON COLUMN public.profile_plans.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.profile_plans.updated_at IS 'Record last update timestamp';


-- =====================================================
-- 3️⃣ Indexes
-- =====================================================

-- Unique index for active plans (prevent duplicate active subscriptions)
CREATE UNIQUE INDEX idx_profile_plans_active_unique
  ON public.profile_plans(user_id, plan_id)
  WHERE status IN ('active', 'trial');

-- Basic search indexes
CREATE INDEX idx_profile_plans_user ON public.profile_plans(user_id);
CREATE INDEX idx_profile_plans_plan ON public.profile_plans(plan_id);
CREATE INDEX idx_profile_plans_status ON public.profile_plans(status);
CREATE INDEX idx_profile_plans_created_at ON public.profile_plans(created_at DESC);

COMMENT ON INDEX idx_profile_plans_active_unique IS 'Ensure one active plan per user';
COMMENT ON INDEX idx_profile_plans_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_plans_plan IS 'Fast search by plan ID';
COMMENT ON INDEX idx_profile_plans_status IS 'Filter plans by status';
COMMENT ON INDEX idx_profile_plans_created_at IS 'Order by creation date';


-- =====================================================
-- ✅ End of File
-- =====================================================

-- Table summary
SELECT
  'profile_plans' AS table_name,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE status = 'active') AS active_plans,
  COUNT(*) FILTER (WHERE status = 'trial') AS trial_plans,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_plans,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.profile_plans;

-- Index information
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename = 'profile_plans'
ORDER BY indexname;

-- Security policies
SELECT
  policyname,
  cmd,
  roles,
  qual AS using_condition,
  with_check
FROM pg_policies
WHERE tablename = 'profile_plans'
ORDER BY policyname;
