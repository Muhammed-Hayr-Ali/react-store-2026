-- =====================================================
-- Marketna E-Commerce - Test User Data Functions
-- File: 05_test_user_functions.sql
-- Version: 1.0
-- Date: 2026-03-22
-- Description: Comprehensive test file for secure user data functions
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Test Setup (create test data)
-- 2. Test Function 1: get_my_complete_data()
-- 3. Test Function 2: get_my_permissions()
-- 4. Test Function 3: do_i_have_permission()
-- 5. Test Function 4: get_my_setup_status()
-- 6. Test Function 5: get_user_complete_data_admin()
-- 7. Test Cleanup (remove test data)
-- =====================================================


-- =====================================================
-- 1️⃣ TEST SETUP - Create Test Data
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Check if test user exists (use your current user)
-- ─────────────────────────────────────────────────────

SELECT 
  'Current User Info' AS test_name,
  auth.uid() AS user_id,
  auth.jwt() ->> 'email' AS email,
  auth.jwt() ->> 'role' AS auth_role;


-- ─────────────────────────────────────────────────────
-- Verify required tables exist
-- ─────────────────────────────────────────────────────

SELECT 
  'Table Check' AS test_name,
  table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.name)
    THEN '✅ Exists' ELSE '❌ Missing' END AS status
FROM (VALUES 
  ('profiles'),
  ('roles'),
  ('profile_roles'),
  ('plans'),
  ('profile_plans')
) AS t(name);


-- ─────────────────────────────────────────────────────
-- Verify test data exists (roles and plans)
-- ─────────────────────────────────────────────────────

SELECT 'Roles Check' AS test_name, COUNT(*) AS role_count FROM public.roles;
SELECT 'Plans Check' AS test_name, COUNT(*) AS plan_count FROM public.plans;
SELECT 'Profile Check' AS test_name, COUNT(*) AS profile_count FROM public.profiles;


-- =====================================================
-- 2️⃣ TEST Function 1: get_my_complete_data()
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Get my complete data
-- ─────────────────────────────────────────────────────

SELECT 'TEST 1: get_my_complete_data()' AS test_name;

SELECT 
  user_id,
  email,
  full_name,
  role_names,
  active_plan_name,
  active_plan_status,
  has_active_role,
  has_active_plan,
  is_fully_setup
FROM public.get_my_complete_data();


-- ─────────────────────────────────────────────────────
-- Test: Verify JSONB fields are valid
-- ─────────────────────────────────────────────────────

SELECT 
  'TEST 1b: JSONB Validation' AS test_name,
  CASE WHEN jsonb_typeof(roles) = 'array' THEN '✅ Valid' ELSE '❌ Invalid' END AS roles_valid,
  CASE WHEN jsonb_typeof(plans) = 'array' THEN '✅ Valid' ELSE '❌ Invalid' END AS plans_valid,
  CASE WHEN jsonb_typeof(all_permissions) = 'array' THEN '✅ Valid' ELSE '❌ Invalid' END AS permissions_valid
FROM public.get_my_complete_data();


-- =====================================================
-- 3️⃣ TEST Function 2: get_my_permissions()
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Get my permissions
-- ─────────────────────────────────────────────────────

SELECT 'TEST 2: get_my_permissions()' AS test_name;

SELECT 
  'My Permissions' AS test_name,
  public.get_my_permissions() AS permissions,
  jsonb_array_length(public.get_my_permissions()) AS permission_count;


-- =====================================================
-- 4️⃣ TEST Function 3: do_i_have_permission()
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Check specific permissions
-- ─────────────────────────────────────────────────────

SELECT 'TEST 3: do_i_have_permission()' AS test_name;

SELECT 
  'Permission Checks' AS test_name,
  public.do_i_have_permission('products:read') AS can_read_products,
  public.do_i_have_permission('products:create') AS can_create_products,
  public.do_i_have_permission('orders:create') AS can_create_orders,
  public.do_i_have_permission('users:manage') AS can_manage_users,
  public.do_i_have_permission('*:*') AS has_full_access;


-- =====================================================
-- 5️⃣ TEST Function 4: get_my_setup_status()
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Get my setup status
-- ─────────────────────────────────────────────────────

SELECT 'TEST 4: get_my_setup_status()' AS test_name;

SELECT 
  has_profile,
  has_active_role,
  active_roles,
  has_active_plan,
  active_plan_name,
  active_plan_status,
  is_fully_setup,
  missing_components,
  message
FROM public.get_my_setup_status();


-- =====================================================
-- 6️⃣ TEST Function 5: get_user_complete_data_admin()
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Admin access (should fail for non-admin)
-- ─────────────────────────────────────────────────────

SELECT 'TEST 5: get_user_complete_data_admin()' AS test_name;

-- This should fail if current user is not admin
SELECT 
  'Admin Access Test' AS test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profile_roles pr
      JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid() AND r.name = 'admin' AND pr.is_active = TRUE
    ) THEN '✅ User is admin - can access'
    ELSE '⚠️ User is not admin - will fail'
  END AS admin_status;

-- Try to access (will fail if not admin)
BEGIN
  SELECT * FROM public.get_user_complete_data_admin(auth.uid());
EXCEPTION WHEN OTHERS THEN
  SELECT 'ERROR: ' || SQLERRM AS admin_access_result;
END;


-- =====================================================
-- 7️⃣ TEST Summary - All Tests Results
-- =====================================================

SELECT '========================================' AS separator;
SELECT '        TEST SUMMARY REPORT            ' AS report_title;
SELECT '========================================' AS separator;

SELECT 
  'Test Summary' AS report_section,
  COUNT(*) FILTER (WHERE is_fully_setup = TRUE) AS users_fully_setup,
  COUNT(*) FILTER (WHERE has_active_role = TRUE) AS users_with_roles,
  COUNT(*) FILTER (WHERE has_active_plan = TRUE) AS users_with_plans
FROM public.get_my_setup_status();


-- =====================================================
-- 8️⃣ Performance Test (Optional)
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Function execution time
-- ─────────────────────────────────────────────────────

SELECT 'PERFORMANCE TEST' AS test_name;

\timing on

-- Measure execution time
SELECT public.get_my_complete_data();

\timing off


-- =====================================================
-- 9️⃣ Security Test (Important!)
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Test: Verify functions use auth.uid() not parameters
-- ─────────────────────────────────────────────────────

SELECT 'SECURITY TEST' AS test_name;

SELECT 
  'Security Check' AS test_name,
  CASE 
    WHEN prosrc LIKE '%auth.uid()%' THEN '✅ Uses auth.uid()'
    ELSE '❌ Does NOT use auth.uid()'
  END AS security_status
FROM pg_proc
WHERE proname = 'get_my_complete_data';


-- =====================================================
-- ✅ End of Test File
-- =====================================================

SELECT '========================================' AS separator;
SELECT '        ALL TESTS COMPLETED            ' AS completion_message;
SELECT '========================================' AS separator;
