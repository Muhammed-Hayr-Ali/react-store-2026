-- =====================================================
-- Marketna E-Commerce - Get Current User Data Function
-- File: 09_get_current_user_data.sql
-- Version: 1.2 (Corrected - Security & Performance)
-- Date: 2026-03-22
-- Description: Secure function to fetch current user's complete data
-- =====================================================

-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP FUNCTION IF EXISTS public.get_current_user_data() CASCADE;


-- =====================================================
-- 2️⃣ CREATE SECURE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_current_user_data()
RETURNS TABLE (
  -- 🔹 Profile Information
  user_id           UUID,
  email             TEXT,
  provider          TEXT,
  first_name        TEXT,
  last_name         TEXT,
  full_name         TEXT,
  phone             TEXT,
  phone_verified    BOOLEAN,
  avatar_url        TEXT,
  bio               TEXT,
  email_verified    BOOLEAN,
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ,
  last_sign_in_at   TIMESTAMPTZ,

  -- 🔹 Roles Information
  roles             JSONB,
  role_names        TEXT[],
  role_permissions  JSONB,

  -- 🔹 Plans Information
  plans             JSONB,
  active_plan_name  TEXT,
  active_plan_status TEXT,
  plan_permissions  JSONB,

  -- 🔹 Combined Permissions
  all_permissions   JSONB,

  -- 🔹 Setup Status Metadata
  has_active_role   BOOLEAN,
  has_active_plan   BOOLEAN,
  is_fully_setup    BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 🔹 Get authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: user not logged in';
  END IF;

  RETURN QUERY
  WITH user_roles AS (
    -- 🔹 CTE for roles - aggregate DISTINCT roles only
    SELECT
      pr.user_id,
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'role_id', r.id,
          'role_name', r.name::TEXT,
          'description', r.description,
          'permissions', r.permissions,
          'is_active', pr.is_active,
          'granted_at', pr.granted_at
        )
      ) AS roles_json,
      array_agg(DISTINCT r.name::TEXT) AS role_names_array
    FROM public.profile_roles pr
    INNER JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.user_id = v_user_id AND pr.is_active = TRUE
    GROUP BY pr.user_id
  ),
  role_permissions_agg AS (
    -- 🔹 Separate CTE for role permissions (avoids duplication)
    SELECT
      pr.user_id,
      jsonb_agg(DISTINCT perm) FILTER (WHERE perm IS NOT NULL) AS role_perms_json
    FROM public.profile_roles pr
    INNER JOIN public.roles r ON r.id = pr.role_id,
    jsonb_array_elements_text(r.permissions) AS perm
    WHERE pr.user_id = v_user_id AND pr.is_active = TRUE
    GROUP BY pr.user_id
  ),
  user_plans AS (
    -- 🔹 CTE for plans - aggregate DISTINCT plans only
    SELECT
      pp.user_id,
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'plan_id', pl.id,
          'plan_name', pl.name,
          'category', pl.category::TEXT,
          'price', pl.price::NUMERIC,
          'billing_period', pl.billing_period,
          'permissions', pl.permissions,
          'status', pp.status,
          'start_date', pp.start_date,
          'end_date', pp.end_date,
          'trial_end_date', pp.trial_end_date
        )
      ) AS plans_json
    FROM public.profile_plans pp
    INNER JOIN public.plans pl ON pl.id = pp.plan_id
    WHERE pp.user_id = v_user_id AND pp.status IN ('active', 'trial')
    GROUP BY pp.user_id
  ),
  plan_info AS (
    -- 🔹 Separate CTE for plan info (avoids duplication)
    SELECT
      pp.user_id,
      (SELECT pl.name FROM public.plans pl
       WHERE pl.id = pp.plan_id LIMIT 1) AS active_plan,
      pp.status AS active_status
    FROM public.profile_plans pp
    WHERE pp.user_id = v_user_id AND pp.status IN ('active', 'trial')
    LIMIT 1
  ),
  plan_permissions_agg AS (
    -- 🔹 Separate CTE for plan permissions (avoids duplication)
    SELECT
      pp.user_id,
      jsonb_object_agg(key, value) FILTER (WHERE (value)::boolean = TRUE) AS plan_perms_json
    FROM public.profile_plans pp
    INNER JOIN public.plans pl ON pl.id = pp.plan_id,
    jsonb_each(pl.permissions) AS perm(key, value)
    WHERE pp.user_id = v_user_id AND pp.status IN ('active', 'trial')
    GROUP BY pp.user_id
  ),
  combined_perms AS (
    -- 🔹 CTE for combined permissions
    SELECT
      v_user_id AS user_id,
      jsonb_agg(DISTINCT perm) FILTER (WHERE perm IS NOT NULL) AS all_perms
    FROM (
      SELECT jsonb_array_elements_text(r.permissions) AS perm
      FROM public.profile_roles pr
      INNER JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = v_user_id AND pr.is_active = TRUE
      UNION
      SELECT key AS perm
      FROM public.profile_plans pp
      INNER JOIN public.plans pl ON pl.id = pp.plan_id,
      jsonb_each(pl.permissions) AS perm(key, value)
      WHERE pp.user_id = v_user_id AND pp.status IN ('active', 'trial')
      AND (perm.value)::boolean = TRUE
    ) AS all_perms
  )
  SELECT
    -- Profile
    p.id, p.email, p.provider, p.first_name, p.last_name, p.full_name,
    p.phone, p.phone_verified, p.avatar_url, p.bio, p.email_verified,
    p.created_at, p.updated_at, p.last_sign_in_at,

    -- Roles (with COALESCE for empty arrays)
    COALESCE(ur.roles_json, '[]'::jsonb) AS roles,
    COALESCE(ur.role_names_array, ARRAY[]::TEXT[]) AS role_names,
    COALESCE(rp.role_perms_json, '[]'::jsonb) AS role_permissions,

    -- Plans (with COALESCE for empty arrays)
    COALESCE(up.plans_json, '[]'::jsonb) AS plans,
    pi.active_plan AS active_plan_name,
    pi.active_status AS active_plan_status,
    COALESCE(pp.plan_perms_json, '{}'::jsonb) AS plan_permissions,

    -- Combined Permissions
    COALESCE(cp.all_perms, '[]'::jsonb) AS all_permissions,

    -- Setup Status
    (ur.user_id IS NOT NULL) AS has_active_role,
    (up.user_id IS NOT NULL) AS has_active_plan,
    (ur.user_id IS NOT NULL AND up.user_id IS NOT NULL) AS is_fully_setup

  FROM public.profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  LEFT JOIN role_permissions_agg rp ON rp.user_id = p.id
  LEFT JOIN user_plans up ON up.user_id = p.id
  LEFT JOIN plan_info pi ON pi.user_id = p.id
  LEFT JOIN plan_permissions_agg pp ON pp.user_id = p.id
  LEFT JOIN combined_perms cp ON cp.user_id = p.id
  WHERE p.id = v_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION public.get_current_user_data IS 'جلب بيانات المستخدم الحالي الشاملة: بروفايل + أدوار + خطط + صلاحيات (آمن)';


-- =====================================================
-- 3️⃣ GRANT PERMISSIONS
-- =====================================================

-- 🔹 Only authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.get_current_user_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_data() TO postgres;
GRANT EXECUTE ON FUNCTION public.get_current_user_data() TO service_role;

-- 🔹 Revoke from public (security)
REVOKE ALL ON FUNCTION public.get_current_user_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_user_data() FROM anon;


-- =====================================================
-- 4️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Function created successfully!' AS status,
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_current_user_data';

-- Alternative verification using pg_proc (more reliable)
SELECT 
  '✅ Alternative check:' AS note,
  proname AS function_name,
  CASE provolatile 
    WHEN 'i' THEN 'IMMUTABLE' 
    WHEN 's' THEN 'STABLE' 
    WHEN 'v' THEN 'VOLATILE' 
  END AS volatility,
  CASE prosecdef 
    WHEN true THEN 'SECURITY DEFINER' 
    ELSE 'INVOKER' 
  END AS security
FROM pg_proc
WHERE proname = 'get_current_user_data'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');


-- =====================================================
-- 5️⃣ USAGE EXAMPLE
-- =====================================================
/*
-- Call the function (authenticated users only)
SELECT * FROM public.get_current_user_data();

-- Expected output:
-- user_id: UUID
-- email: TEXT
-- roles: JSONB [{role_id, role_name, permissions...}]
-- role_names: TEXT[] ['customer', 'vendor'...]
-- plans: JSONB [{plan_id, plan_name, status...}]
-- all_permissions: JSONB ["products:read", "orders:create"...]
-- is_fully_setup: BOOLEAN
*/