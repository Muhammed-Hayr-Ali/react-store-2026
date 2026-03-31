-- =====================================================
-- Marketna E-Commerce - Roles Helper Functions
-- File: 03_roles/2_create_policy.sql
-- Version: 1.0 (Phase 1 - After profile_roles)
-- Date: 2026-03-22
-- Description: Helper functions that depend on profile_roles
-- Dependencies: public.roles, public.profile_roles
-- Run AFTER: 04_profile_roles_links.sql
-- =====================================================

-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================
DROP FUNCTION IF EXISTS public.check_user_has_role(TEXT) CASCADE;


-- =====================================================
-- 2️⃣ HELPER FUNCTION: Check User Role
-- 🔹 SECURITY DEFINER bypasses RLS safely
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profile_roles pr
    JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.user_id = auth.uid() 
      AND r.name = required_role::public.role_name
      AND pr.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.check_user_has_role IS 'Check if current user has a specific role (bypasses RLS safely)';


-- =====================================================
-- 3️⃣ GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.check_user_has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_has_role(TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION public.check_user_has_role(TEXT) TO service_role;


-- =====================================================
-- 4️⃣ VERIFICATION
-- =====================================================
SELECT 
  '✅ check_user_has_role() function created!' AS status,
  proname AS function_name,
  CASE prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'INVOKER' END AS security
FROM pg_proc
WHERE proname = 'check_user_has_role'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');