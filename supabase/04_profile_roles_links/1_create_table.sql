-- =====================================================
-- Marketna E-Commerce - Profile Roles Link Table
-- File: 04_profile_roles_links.sql
-- Version: 5.0 (Final - No Duplicate Constraints)
-- Date: 2026-03-22
-- Description: Profile roles linking table - assigns roles to users
-- Dependencies: public.profiles, public.roles, auth.users
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Robust cleanup before creation
-- 2. Create profile roles table (no duplicate FKs)
-- 3. Indexes
-- 4. Row Level Security (RLS)
-- 5. Verification
-- =====================================================


-- =====================================================
-- 1️⃣ ROBUST CLEANUP
-- =====================================================

-- Drop policies first (with error handling)
DO $$ BEGIN
  DROP POLICY IF EXISTS "profile_roles_read_own" ON public.profile_roles;
  DROP POLICY IF EXISTS "profile_roles_admin_read_all" ON public.profile_roles;
  DROP POLICY IF EXISTS "profile_roles_admin_manage" ON public.profile_roles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Drop indexes
DROP INDEX IF EXISTS idx_profile_roles_user;
DROP INDEX IF EXISTS idx_profile_roles_role;
DROP INDEX IF EXISTS idx_profile_roles_active;
DROP INDEX IF EXISTS idx_profile_roles_granted_at;

-- Drop table with CASCADE (removes ALL constraints)
-- Using DO block to handle any dependency errors
DO $$ BEGIN
  DROP TABLE IF EXISTS public.profile_roles CASCADE;
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'Cleanup completed with warnings: %', SQLERRM;
END $$;


-- =====================================================
-- 2️⃣ CREATE TABLE (No Duplicate Foreign Keys)
-- =====================================================

CREATE TABLE public.profile_roles (
  -- Composite Primary Key (prevents duplicate role assignments)
  user_id      UUID NOT NULL,
  role_id      UUID NOT NULL,
  
  -- Metadata
  is_active    BOOLEAN DEFAULT TRUE,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  -- ✅ Only inline reference (no duplicate named constraint)
  granted_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Primary Key
  PRIMARY KEY (user_id, role_id),
  
  -- ✅ Named Foreign Keys (ONLY for user_id and role_id)
  CONSTRAINT profile_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_roles_role_id_fkey 
    FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
  -- ✅ granted_by uses inline reference only (no duplicate)
);

-- Comments
COMMENT ON TABLE public.profile_roles IS 'Profile roles linking table - assigns roles to users';
COMMENT ON COLUMN public.profile_roles.user_id IS 'User ID (from profiles.id)';
COMMENT ON COLUMN public.profile_roles.role_id IS 'Role ID (from roles.id)';
COMMENT ON COLUMN public.profile_roles.is_active IS 'Whether role is currently active';
COMMENT ON COLUMN public.profile_roles.granted_at IS 'Role grant timestamp';
COMMENT ON COLUMN public.profile_roles.granted_by IS 'Auth user who granted the role (nullable)';


-- =====================================================
-- 3️⃣ INDEXES
-- =====================================================

CREATE INDEX idx_profile_roles_user ON public.profile_roles(user_id);
CREATE INDEX idx_profile_roles_role ON public.profile_roles(role_id);
CREATE INDEX idx_profile_roles_active ON public.profile_roles(is_active);
CREATE INDEX idx_profile_roles_granted_at ON public.profile_roles(granted_at DESC);

COMMENT ON INDEX idx_profile_roles_user IS 'Fast search by user ID';
COMMENT ON INDEX idx_profile_roles_role IS 'Fast search by role ID';
COMMENT ON INDEX idx_profile_roles_active IS 'Filter active roles';
COMMENT ON INDEX idx_profile_roles_granted_at IS 'Sort by grant date';


-- =====================================================
-- 4️⃣ ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Policy 1: Users can read their own active roles
-- =====================================================
CREATE POLICY "profile_roles_read_own"
  ON public.profile_roles FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
    AND is_active = TRUE
  );

-- =====================================================
-- Policy 2: Admins can read all roles
-- =====================================================
CREATE POLICY "profile_roles_admin_read_all"
  ON public.profile_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  );

-- =====================================================
-- Policy 3: Admins can manage all roles (CRUD)
-- =====================================================
CREATE POLICY "profile_roles_admin_manage"
  ON public.profile_roles FOR ALL TO authenticated
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
  '✅ Profile roles table created successfully!' AS status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profile_roles') AS columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'profile_roles') AS indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profile_roles') AS policies,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = 'profile_roles' AND constraint_type = 'FOREIGN KEY') AS foreign_keys;
