-- =====================================================
-- Marketna E-Commerce - Profile Plans Link Table
-- File: 06_profile_plans_links.sql
-- Version: 4.2 (Final Audited - Phase 1 Only)
-- Date: 2026-03-22
-- Description: Profile plans linking table - assigns subscription plans to users
-- Dependencies: public.profiles, public.plans
-- =====================================================

-- ⚠️ NOTE: Admin policies moved to Phase 2 (12_profile_plans_admin_policies.sql)
-- to maintain consistency with Phase 1/Phase 2 separation

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup before creation
-- 2. Create profile plans table
-- 3. Indexes
-- 4. Row Level Security (RLS) - Phase 1 Only
-- 5. Trigger for updated_at
-- 6. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DO $$ BEGIN
  DROP POLICY IF EXISTS "profile_plans_read_own" ON public.profile_plans;
  DROP POLICY IF EXISTS "profile_plans_admin_read_all" ON public.profile_plans;
  DROP POLICY IF EXISTS "profile_plans_admin_manage" ON public.profile_plans;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP TRIGGER IF EXISTS profile_plans_updated_at_trigger ON public.profile_plans;
DROP FUNCTION IF EXISTS public.update_profile_plans_updated_at() CASCADE;

DROP INDEX IF EXISTS idx_profile_plans_active_unique;
DROP INDEX IF EXISTS idx_profile_plans_user;
DROP INDEX IF EXISTS idx_profile_plans_plan;
DROP INDEX IF EXISTS idx_profile_plans_status;
DROP INDEX IF EXISTS idx_profile_plans_created_at;
DROP INDEX IF EXISTS idx_profile_plans_end_date;

DROP TABLE IF EXISTS public.profile_plans CASCADE;


-- =====================================================
-- 2️⃣ CREATE TABLE
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
CREATE INDEX idx_profile_plans_end_date ON public.profile_plans(end_date) WHERE end_date IS NOT NULL;

COMMENT ON INDEX idx_profile_plans_active_unique IS 'Ensure one active plan per user per plan type';
COMMENT ON INDEX idx_profile_plans_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_plans_plan IS 'Fast search by plan ID';
COMMENT ON INDEX idx_profile_plans_status IS 'Filter plans by status';
COMMENT ON INDEX idx_profile_plans_created_at IS 'Order by creation date';
COMMENT ON INDEX idx_profile_plans_end_date IS 'Find expiring plans quickly';


-- =====================================================
-- 4️⃣ ROW LEVEL SECURITY (RLS) - Phase 1 Only
-- =====================================================

ALTER TABLE public.profile_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own plans
-- =====================================================
CREATE POLICY "profile_plans_read_own"
  ON public.profile_plans FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 🔹 سياسات Admin تم نقلها لـ Phase 2 (12_profile_plans_admin_policies.sql)


-- =====================================================
-- 5️⃣ TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_profile_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_plans_updated_at_trigger
  BEFORE UPDATE ON public.profile_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_plans_updated_at();


-- =====================================================
-- 6️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Profile plans table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profile_plans') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profile_plans') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profile_plans') AS policies,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'profile_plans' AND constraint_type = 'FOREIGN KEY') AS foreign_keys,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name = 'profile_plans' AND constraint_type = 'CHECK') AS check_constraints;


-- =====================================================
-- 7️⃣ PHASE 2 REMINDER
-- =====================================================
/*
📋 PHASE 2 - Admin Policies (Execute after 03b_roles_functions.sql):

File: 12_profile_plans_admin_policies.sql

CREATE POLICY "profile_plans_admin_read_all"
  ON public.profile_plans FOR SELECT TO authenticated
  USING (
    public.check_user_has_role('admin') OR user_id = auth.uid()
  );

CREATE POLICY "profile_plans_admin_manage"
  ON public.profile_plans FOR ALL TO authenticated
  USING (
    public.check_user_has_role('admin')
  )
  WITH CHECK (
    public.check_user_has_role('admin')
  );
*/