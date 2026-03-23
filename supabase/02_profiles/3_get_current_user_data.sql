-- =====================================================
-- Marketna E-Commerce - Get Current User Data Function
-- File: 09_get_current_user_data.sql
-- Version: 1.1 (Fixed verification query)
-- Date: 2026-03-22
-- Description: Secure function to fetch current user's complete data
-- =====================================================

-- =====================================================
-- 1️⃣ CREATE SECURE FUNCTION
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
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: user not logged in';
  END IF;

  RETURN QUERY
  SELECT
    -- Profile
    p.id, p.email, p.provider, p.first_name, p.last_name, p.full_name,
    p.phone, p.phone_verified, p.avatar_url, p.bio, p.email_verified,
    p.created_at, p.updated_at, p.last_sign_in_at,

    -- Roles
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
         'role_id', r.id, 'role_name', r.name::TEXT, 'description', r.description,
         'permissions', r.permissions, 'is_active', pr.is_active, 'granted_at', pr.granted_at
       ))
       FROM public.profile_roles pr
       INNER JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = p.id AND pr.is_active = TRUE),
      '[]'::jsonb
    ) AS roles,
    
    COALESCE(
      (SELECT array_agg(DISTINCT r.name::TEXT)
       FROM public.profile_roles pr
       INNER JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = p.id AND pr.is_active = TRUE),
      ARRAY[]::TEXT[]
    ) AS role_names,
    
    COALESCE(
      (SELECT jsonb_agg(DISTINCT perm) FILTER (WHERE perm IS NOT NULL)
       FROM public.profile_roles pr
       INNER JOIN public.roles r ON r.id = pr.role_id,
       jsonb_array_elements_text(r.permissions) AS perm
       WHERE pr.user_id = p.id AND pr.is_active = TRUE),
      '[]'::jsonb
    ) AS role_permissions,

    -- Plans
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
         'plan_id', pl.id, 'plan_name', pl.name, 'category', pl.category::TEXT,
         'price', pl.price::NUMERIC, 'billing_period', pl.billing_period,
         'permissions', pl.permissions, 'status', pp.status,
         'start_date', pp.start_date, 'end_date', pp.end_date,
         'trial_end_date', pp.trial_end_date
       ))
       FROM public.profile_plans pp
       INNER JOIN public.plans pl ON pl.id = pp.plan_id
       WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')),
      '[]'::jsonb
    ) AS plans,
    
    (SELECT pl.name FROM public.profile_plans pp
     INNER JOIN public.plans pl ON pl.id = pp.plan_id
     WHERE pp.user_id = p.id AND pp.status = 'active' LIMIT 1) AS active_plan_name,
    
    (SELECT pp.status FROM public.profile_plans pp
     WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial') LIMIT 1) AS active_plan_status,
    
    COALESCE(
      (SELECT jsonb_object_agg(key, value)
       FROM public.profile_plans pp
       INNER JOIN public.plans pl ON pl.id = pp.plan_id,
       jsonb_each(pl.permissions) AS perm(key, value)
       WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
       AND (perm.value)::boolean = TRUE),
      '{}'::jsonb
    ) AS plan_permissions,

    -- Combined Permissions
    COALESCE(
      (SELECT jsonb_agg(DISTINCT perm) FILTER (WHERE perm IS NOT NULL)
       FROM (
         SELECT jsonb_array_elements_text(r.permissions) AS perm
         FROM public.profile_roles pr
         INNER JOIN public.roles r ON r.id = pr.role_id
         WHERE pr.user_id = p.id AND pr.is_active = TRUE
         UNION
         SELECT key AS perm
         FROM public.profile_plans pp
         INNER JOIN public.plans pl ON pl.id = pp.plan_id,
         jsonb_each(pl.permissions) AS perm(key, value)
         WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
         AND (perm.value)::boolean = TRUE
       ) AS all_perms),
      '[]'::jsonb
    ) AS all_permissions,

    -- Setup Status
    EXISTS (SELECT 1 FROM public.profile_roles pr WHERE pr.user_id = p.id AND pr.is_active = TRUE) AS has_active_role,
    EXISTS (SELECT 1 FROM public.profile_plans pp WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')) AS has_active_plan,
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = p.id)
     AND EXISTS (SELECT 1 FROM public.profile_roles pr WHERE pr.user_id = p.id AND pr.is_active = TRUE)
     AND EXISTS (SELECT 1 FROM public.profile_plans pp WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial'))
    ) AS is_fully_setup

  FROM public.profiles p
  WHERE p.id = v_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_current_user_data IS 'جلب بيانات المستخدم الحالي الشاملة: بروفايل + أدوار + خطط + صلاحيات (آمن)';


-- =====================================================
-- 2️⃣ VERIFICATION (Fixed - compatible columns only)
-- =====================================================

SELECT 
  '✅ Function created successfully!' AS status,
  routine_name,
  routine_type,
  data_type,
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
