-- =====================================================
-- Marketna E-Commerce - Profile Plans Link Table
-- File: 06_profile_plans_links.sql
-- Version: 4.0 (Final)
-- Date: 2026-03-22
-- Description: Profile plans linking table - assigns plans to users
-- Dependencies: public.profiles, public.plans
-- Links: user_id → profiles.id, plan_id → plans.id
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create profile plans table
-- 3. Indexes
-- 4. Row Level Security (RLS)
-- 5. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

-- Drop policies first (with error handling)
DO $$ BEGIN
  DROP POLICY IF EXISTS "profile_plans_read_own" ON public.profile_plans;
  DROP POLICY IF EXISTS "profile_plans_admin_read_all" ON public.profile_plans;
  DROP POLICY IF EXISTS "profile_plans_admin_manage" ON public.profile_plans;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop indexes
DROP INDEX IF EXISTS idx_profile_plans_active_unique;
DROP INDEX IF EXISTS idx_profile_plans_user;
DROP INDEX IF EXISTS idx_profile_plans_plan;
DROP INDEX IF EXISTS idx_profile_plans_status;
DROP INDEX IF EXISTS idx_profile_plans_created_at;

-- Drop table (CASCADE removes all constraints)
DROP TABLE IF EXISTS public.profile_plans CASCADE;


-- =====================================================
-- 2️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.profile_plans (
  -- Primary Key (auto-generated UUID)
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id           UUID NOT NULL,
  plan_id           UUID NOT NULL,
  
  -- Status & Dates
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),
  start_date        TIMESTAMPTZ DEFAULT NOW(),
  end_date          TIMESTAMPTZ,
  trial_end_date    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT profile_plans_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_plans_plan_id_fkey
    FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT,
  CONSTRAINT profile_plans_dates_check
    CHECK (end_date IS NULL OR end_date > start_date)
);

-- Comments
COMMENT ON TABLE public.profile_plans IS 'Profile plans linking table - assigns subscription plans to users';
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
-- 3️⃣ INDEXES
-- =====================================================

-- Unique partial index: one active/trial plan per user per plan
CREATE UNIQUE INDEX idx_profile_plans_active_unique
  ON public.profile_plans(user_id, plan_id)
  WHERE status IN ('active', 'trial');

-- Basic search indexes
CREATE INDEX idx_profile_plans_user ON public.profile_plans(user_id);
CREATE INDEX idx_profile_plans_plan ON public.profile_plans(plan_id);
CREATE INDEX idx_profile_plans_status ON public.profile_plans(status);
CREATE INDEX idx_profile_plans_created_at ON public.profile_plans(created_at DESC);

-- Comments
COMMENT ON INDEX idx_profile_plans_active_unique IS 'Ensure one active plan per user per plan type';
COMMENT ON INDEX idx_profile_plans_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_plans_plan IS 'Fast search by plan ID';
COMMENT ON INDEX idx_profile_plans_status IS 'Filter plans by status';
COMMENT ON INDEX idx_profile_plans_created_at IS 'Order by creation date';


-- =====================================================
-- 4️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profile_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own plans
-- =====================================================
CREATE POLICY "profile_plans_read_own"
  ON public.profile_plans FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
  );

-- =====================================================
-- Policy 2: Admins can read all plans
-- =====================================================
CREATE POLICY "profile_plans_admin_read_all"
  ON public.profile_plans FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  );

-- =====================================================
-- Policy 3: Admins can manage all plans (CRUD)
-- =====================================================
CREATE POLICY "profile_plans_admin_manage"
  ON public.profile_plans FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  )
  WITH CHECK (true);


-- =====================================================
-- 5️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Profile plans table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profile_plans') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profile_plans') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profile_plans') AS policies,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'profile_plans' AND constraint_type = 'FOREIGN KEY') AS foreign_keys,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'profile_plans' AND constraint_type = 'CHECK') AS check_constraints;
