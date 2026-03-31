-- =====================================================
-- Marketna E-Commerce - Profile Roles Link Table
-- File: 04_profile_roles_links/1_create_table.sql
-- Version: 5.2 (Final Audited - Phase 1 Only)
-- Date: 2026-03-22
-- Description: Profile roles linking table - assigns roles to users
-- Dependencies: public.profiles, public.roles
-- =====================================================

-- ⚠️ NOTE: Admin policies moved to Phase 2 (11_profile_roles_admin_policies.sql)
-- to avoid dependency on check_user_has_role() function

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Robust cleanup before creation
-- 2. Create profile roles table
-- 3. Indexes
-- 4. Row Level Security (RLS) - Phase 1 Only
-- 5. Trigger for granted_by
-- 6. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ ROBUST CLEANUP
-- =====================================================

DO $$ BEGIN
  DROP POLICY IF EXISTS "profile_roles_read_own" ON public.profile_roles;
  DROP POLICY IF EXISTS "profile_roles_admin_read_all" ON public.profile_roles;
  DROP POLICY IF EXISTS "profile_roles_admin_manage" ON public.profile_roles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP INDEX IF EXISTS idx_profile_roles_user;
DROP INDEX IF EXISTS idx_profile_roles_role;
DROP INDEX IF EXISTS idx_profile_roles_active;
DROP INDEX IF EXISTS idx_profile_roles_granted_at;
DROP INDEX IF EXISTS idx_profile_roles_granted_by;

DO $$ BEGIN
  DROP TABLE IF EXISTS public.profile_roles CASCADE;
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'Cleanup completed with warnings: %', SQLERRM;
END $$;


-- =====================================================
-- 2️⃣ CREATE TABLE
-- =====================================================

CREATE TABLE public.profile_roles (
  user_id      UUID NOT NULL,
  role_id      UUID NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  granted_by   UUID,
  
  PRIMARY KEY (user_id, role_id),
  
  CONSTRAINT profile_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_roles_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE public.profile_roles IS 'Profile roles linking table - assigns roles to users';
COMMENT ON COLUMN public.profile_roles.user_id IS 'User ID (from profiles.id)';
COMMENT ON COLUMN public.profile_roles.role_id IS 'Role ID (from roles.id)';
COMMENT ON COLUMN public.profile_roles.is_active IS 'Whether role is currently active';
COMMENT ON COLUMN public.profile_roles.granted_at IS 'Role grant timestamp';
COMMENT ON COLUMN public.profile_roles.granted_by IS 'User who granted the role (nullable, no FK)';


-- =====================================================
-- 3️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_profile_roles_user ON public.profile_roles(user_id);
CREATE INDEX idx_profile_roles_role ON public.profile_roles(role_id);
CREATE INDEX idx_profile_roles_active ON public.profile_roles(is_active);
CREATE INDEX idx_profile_roles_granted_at ON public.profile_roles(granted_at DESC);
CREATE INDEX idx_profile_roles_granted_by ON public.profile_roles(granted_by);

COMMENT ON INDEX idx_profile_roles_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_roles_role IS 'Fast search by role ID';
COMMENT ON INDEX idx_profile_roles_active IS 'Filter active roles';
COMMENT ON INDEX idx_profile_roles_granted_at IS 'Sort by grant date';
COMMENT ON INDEX idx_profile_roles_granted_by IS 'Search by grantor';


-- =====================================================
-- 4️⃣ ROW LEVEL SECURITY (RLS) - Phase 1 Only
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own active roles
-- =====================================================
CREATE POLICY "profile_roles_read_own"
  ON public.profile_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND is_active = TRUE);

-- 🔹 سياسات Admin تم نقلها لـ Phase 2 (11_profile_roles_admin_policies.sql)
-- السبب: تعتمد على دالة check_user_has_role() غير الموجودة بعد


-- =====================================================
-- 5️⃣ TRIGGER: Auto-populate granted_by
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_profile_roles_granted_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.granted_by IS NULL THEN
    NEW.granted_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER profile_roles_granted_by_trigger
  BEFORE INSERT ON public.profile_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_roles_granted_by();


-- =====================================================
-- 6️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Profile roles table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profile_roles') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profile_roles') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profile_roles') AS policies,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = 'profile_roles' AND constraint_type = 'FOREIGN KEY') AS foreign_keys;


-- =====================================================
-- 7️⃣ PHASE 2 REMINDER
-- =====================================================
/*
📋 PHASE 2 - Admin Policies (Execute after 03_roles/2_create_policy.sql):

File: 11_profile_roles_admin_policies.sql

CREATE POLICY "profile_roles_admin_read_all"
  ON public.profile_roles FOR SELECT TO authenticated
  USING (
    public.check_user_has_role('admin') OR user_id = auth.uid()
  );

CREATE POLICY "profile_roles_admin_manage"
  ON public.profile_roles FOR ALL TO authenticated
  USING (
    public.check_user_has_role('admin')
  )
  WITH CHECK (
    public.check_user_has_role('admin')
  );
*/