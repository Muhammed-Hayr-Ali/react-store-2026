-- =====================================================
-- Marketna E-Commerce - Roles RLS Policies
-- File: 03b_roles_rls_policies.sql
-- Version: 1.1 (Final)
-- Run AFTER: 04_profile_roles_links.sql
-- =====================================================

-- =====================================================
-- Cleanup
-- =====================================================
DROP POLICY IF EXISTS "roles_admin_read_all" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;

-- =====================================================
-- Policy 1: Admins can read all roles
-- =====================================================
CREATE POLICY "roles_admin_read_all"
  ON public.roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  );

COMMENT ON POLICY "roles_admin_read_all" ON public.roles IS 'Admins can read all roles';

-- =====================================================
-- Policy 2: Admins can manage all roles (CRUD)
-- =====================================================
CREATE POLICY "roles_admin_manage"
  ON public.roles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "roles_admin_manage" ON public.roles IS 'Admins can manage all roles (CRUD)';

-- =====================================================
-- Verification
-- =====================================================
SELECT 
  '✅ Admin policies created successfully!' AS status,
  COUNT(*) AS policy_count
FROM pg_policies 
WHERE tablename = 'roles' 
  AND policyname IN ('roles_admin_read_all', 'roles_admin_manage');
