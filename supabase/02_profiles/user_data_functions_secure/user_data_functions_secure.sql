-- =====================================================
-- Marketna E-Commerce - Secure User Data Functions
-- File: 04_user_data_functions_secure.sql
-- Version: 2.0
-- Date: 2026-03-22
-- Description: Secure user data functions - uses auth.uid() only
-- Security: ⚠️ NO user_id parameter - prevents unauthorized access
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Function: Get current user complete data (auth.uid only)
-- 2. Function: Get current user permissions (auth.uid only)
-- 3. Function: Check current user permission (auth.uid only)
-- 4. Function: Get current user setup status (auth.uid only)
-- =====================================================


-- =====================================================
-- 1️⃣ Get Current User Complete Data (SECURE)
-- =====================================================
-- ⚠️ SECURITY: No user_id parameter - uses auth.uid() internally
-- This prevents users from accessing other users' data

CREATE OR REPLACE FUNCTION public.get_my_complete_data()
RETURNS TABLE (
  -- Profile Information
  user_id UUID,
  email TEXT,
  provider TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN,
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  
  -- Roles Information
  roles JSONB,
  role_names TEXT[],
  role_permissions JSONB,
  
  -- Plans Information
  plans JSONB,
  active_plan_name TEXT,
  active_plan_status TEXT,
  plan_permissions JSONB,
  
  -- Combined Permissions
  all_permissions JSONB,
  
  -- Metadata
  has_active_role BOOLEAN,
  has_active_plan BOOLEAN,
  is_fully_setup BOOLEAN
) AS $$
BEGIN
  -- ⚠️ SECURITY: Only return data for the authenticated user
  RETURN QUERY
  SELECT
    -- Profile Information
    p.id AS user_id,
    p.email,
    p.provider,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.phone_verified,
    p.avatar_url,
    p.bio,
    p.email_verified,
    p.created_at,
    p.updated_at,
    p.last_sign_in_at,
    
    -- Roles Information
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'role_id', r.id,
            'role_name', r.name,
            'description', r.description,
            'permissions', r.permissions,
            'is_active', pr.is_active,
            'granted_at', pr.granted_at
          )
        )
        FROM public.profile_roles pr
        JOIN public.roles r ON r.id = pr.role_id
        WHERE pr.user_id = p.id AND pr.is_active = TRUE
      ),
      '[]'::jsonb
    ) AS roles,
    
    COALESCE(
      (
        SELECT array_agg(r.name)
        FROM public.profile_roles pr
        JOIN public.roles r ON r.id = pr.role_id
        WHERE pr.user_id = p.id AND pr.is_active = TRUE
      ),
      ARRAY[]::TEXT[]
    ) AS role_names,
    
    COALESCE(
      (
        SELECT jsonb_agg(DISTINCT perm)
        FROM public.profile_roles pr
        JOIN public.roles r ON r.id = pr.role_id,
        jsonb_array_elements(r.permissions) AS perm
        WHERE pr.user_id = p.id AND pr.is_active = TRUE
      ),
      '[]'::jsonb
    ) AS role_permissions,
    
    -- Plans Information
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'plan_id', pl.id,
            'plan_name', pl.name,
            'category', pl.category,
            'price', pl.price,
            'billing_period', pl.billing_period,
            'permissions', pl.permissions,
            'status', pp.status,
            'start_date', pp.start_date,
            'end_date', pp.end_date,
            'trial_end_date', pp.trial_end_date
          )
        )
        FROM public.profile_plans pp
        JOIN public.plans pl ON pl.id = pp.plan_id
        WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
      ),
      '[]'::jsonb
    ) AS plans,
    
    (
      SELECT pl.name
      FROM public.profile_plans pp
      JOIN public.plans pl ON pl.id = pp.plan_id
      WHERE pp.user_id = p.id AND pp.status = 'active'
      LIMIT 1
    ) AS active_plan_name,
    
    (
      SELECT pp.status
      FROM public.profile_plans pp
      WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
      LIMIT 1
    ) AS active_plan_status,
    
    COALESCE(
      (
        SELECT jsonb_object_agg(key, value)
        FROM public.profile_plans pp
        JOIN public.plans pl ON pl.id = pp.plan_id,
        jsonb_each(pl.permissions) AS perm(key, value)
        WHERE pp.user_id = p.id 
          AND pp.status IN ('active', 'trial')
          AND perm.value = true
      ),
      '{}'::jsonb
    ) AS plan_permissions,
    
    -- All Combined Permissions
    COALESCE(
      (
        SELECT jsonb_agg(DISTINCT perm)
        FROM (
          SELECT jsonb_array_elements(r.permissions) AS perm
          FROM public.profile_roles pr
          JOIN public.roles r ON r.id = pr.role_id
          WHERE pr.user_id = p.id AND pr.is_active = TRUE
          UNION
          SELECT key AS perm
          FROM public.profile_plans pp
          JOIN public.plans pl ON pl.id = pp.plan_id,
          jsonb_each(pl.permissions) AS perm(key, value)
          WHERE pp.user_id = p.id 
            AND pp.status IN ('active', 'trial')
            AND perm.value = true
        ) AS all_perms
      ),
      '[]'::jsonb
    ) AS all_permissions,
    
    -- Metadata
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.user_id = p.id AND pr.is_active = TRUE
    ) AS has_active_role,
    
    EXISTS (
      SELECT 1 FROM public.profile_plans pp
      WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
    ) AS has_active_plan,
    
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = p.id)
      AND EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.user_id = p.id AND pr.is_active = TRUE
      )
      AND EXISTS (
        SELECT 1 FROM public.profile_plans pp
        WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
      )
    ) AS is_fully_setup
    
  FROM public.profiles p
  WHERE p.id = auth.uid();  -- ⚠️ SECURITY: Only current user
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_my_complete_data IS 'جلب بيانات المستخدم الحالي فقط (آمن - يستخدم auth.uid())';


-- =====================================================
-- 2️⃣ Get Current User Permissions (SECURE)
-- =====================================================
-- ⚠️ SECURITY: No user_id parameter - uses auth.uid() internally

CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS JSONB AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT jsonb_agg(DISTINCT perm) INTO v_permissions
  FROM (
    SELECT jsonb_array_elements(r.permissions) AS perm
    FROM public.profile_roles pr
    JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
    
    UNION
    
    SELECT key AS perm
    FROM public.profile_plans pp
    JOIN public.plans pl ON pl.id = pp.plan_id,
    jsonb_each(pl.permissions) AS perm(key, value)
    WHERE pp.user_id = auth.uid() 
      AND pp.status IN ('active', 'trial')
      AND perm.value = true
  ) AS all_perms;
  
  RETURN COALESCE(v_permissions, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_my_permissions IS 'جلب صلاحيات المستخدم الحالي فقط (آمن)';


-- =====================================================
-- 3️⃣ Check Current User Permission (SECURE)
-- =====================================================
-- ⚠️ SECURITY: No user_id parameter - uses auth.uid() internally

CREATE OR REPLACE FUNCTION public.do_i_have_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  v_permissions := public.get_my_permissions();
  
  RETURN EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(v_permissions) AS perm
    WHERE perm = p_permission OR perm = '*:*'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.do_i_have_permission IS 'التحقق من صلاحية للمستخدم الحالي فقط (آمن)';


-- =====================================================
-- 4️⃣ Get Current User Setup Status (SECURE)
-- =====================================================
-- ⚠️ SECURITY: No user_id parameter - uses auth.uid() internally

CREATE OR REPLACE FUNCTION public.get_my_setup_status()
RETURNS TABLE (
  has_profile BOOLEAN,
  has_active_role BOOLEAN,
  active_roles TEXT[],
  has_active_plan BOOLEAN,
  active_plan_name TEXT,
  active_plan_status TEXT,
  is_fully_setup BOOLEAN,
  missing_components TEXT[],
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) AS has_profile,
    
    EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
    ) AS has_active_role,
    
    COALESCE(
      (
        SELECT array_agg(r.name)
        FROM public.profile_roles pr
        JOIN public.roles r ON r.id = pr.role_id
        WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
      ),
      ARRAY[]::TEXT[]
    ) AS active_roles,
    
    EXISTS (
      SELECT 1 FROM public.profile_plans pp
      WHERE pp.user_id = auth.uid() AND pp.status IN ('active', 'trial')
    ) AS has_active_plan,
    
    (
      SELECT pl.name
      FROM public.profile_plans pp
      JOIN public.plans pl ON pl.id = pp.plan_id
      WHERE pp.user_id = auth.uid() AND pp.status = 'active'
      LIMIT 1
    ) AS active_plan_name,
    
    (
      SELECT pp.status
      FROM public.profile_plans pp
      WHERE pp.user_id = auth.uid() AND pp.status IN ('active', 'trial')
      LIMIT 1
    ) AS active_plan_status,
    
    (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profile_roles pr
        WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
      )
      AND EXISTS (
        SELECT 1 FROM public.profile_plans pp
        WHERE pp.user_id = auth.uid() AND pp.status IN ('active', 'trial')
      )
    ) AS is_fully_setup,
    
    (
      SELECT array_agg(component)
      FROM (
        SELECT 'profile' AS component
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
        UNION ALL
        SELECT 'role' AS component
        WHERE NOT EXISTS (
          SELECT 1 FROM public.profile_roles pr
          WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
        )
        UNION ALL
        SELECT 'plan' AS component
        WHERE NOT EXISTS (
          SELECT 1 FROM public.profile_plans pp
          WHERE pp.user_id = auth.uid() AND pp.status IN ('active', 'trial')
        )
      ) AS missing
    ) AS missing_components,
    
    CASE
      WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
        AND EXISTS (
          SELECT 1 FROM public.profile_roles pr
          WHERE pr.user_id = auth.uid() AND pr.is_active = TRUE
        )
        AND EXISTS (
          SELECT 1 FROM public.profile_plans pp
          WHERE pp.user_id = auth.uid() AND pp.status IN ('active', 'trial')
        )
      THEN 'إعداد كامل - جميع المكونات موجودة'
      ELSE 'إعداد ناقص - توجد مكونات مفقودة'
    END::TEXT AS message;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_my_setup_status IS 'التحقق من حالة إعداد المستخدم الحالي (آمن)';


-- =====================================================
-- 5️⃣ Admin Function: Get Any User Data (ADMIN ONLY)
-- =====================================================
-- ⚠️ SECURITY: This function checks if caller is admin before allowing access
-- Only admins can use this to view other users' data

CREATE OR REPLACE FUNCTION public.get_user_complete_data_admin(p_target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  provider TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  phone_verified BOOLEAN,
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  roles JSONB,
  role_names TEXT[],
  role_permissions JSONB,
  plans JSONB,
  active_plan_name TEXT,
  active_plan_status TEXT,
  plan_permissions JSONB,
  all_permissions JSONB,
  has_active_role BOOLEAN,
  has_active_plan BOOLEAN,
  is_fully_setup BOOLEAN
) AS $$
BEGIN
  -- ⚠️ SECURITY: Check if caller is admin first
  IF NOT EXISTS (
    SELECT 1 
    FROM public.profile_roles pr
    JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.user_id = auth.uid()
      AND r.name = 'admin'
      AND pr.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Return data for target user (only if caller is admin)
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.email,
    p.provider,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.phone_verified,
    p.avatar_url,
    p.bio,
    p.email_verified,
    p.created_at,
    p.updated_at,
    p.last_sign_in_at,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('role_id', r.id, 'role_name', r.name, 'permissions', r.permissions))
       FROM public.profile_roles pr JOIN public.roles r ON r.id = pr.role_id
       WHERE pr.user_id = p.id AND pr.is_active = TRUE),
      '[]'::jsonb
    ) AS roles,
    COALESCE((SELECT array_agg(r.name) FROM public.profile_roles pr JOIN public.roles r ON r.id = pr.role_id
              WHERE pr.user_id = p.id AND pr.is_active = TRUE), ARRAY[]::TEXT[]) AS role_names,
    COALESCE((SELECT jsonb_agg(DISTINCT perm) FROM public.profile_roles pr JOIN public.roles r ON r.id = pr.role_id,
              jsonb_array_elements(r.permissions) AS perm WHERE pr.user_id = p.id AND pr.is_active = TRUE), '[]'::jsonb) AS role_permissions,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('plan_id', pl.id, 'plan_name', pl.name, 'status', pp.status))
              FROM public.profile_plans pp JOIN public.plans pl ON pl.id = pp.plan_id
              WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')), '[]'::jsonb) AS plans,
    (SELECT pl.name FROM public.profile_plans pp JOIN public.plans pl ON pl.id = pp.plan_id
     WHERE pp.user_id = p.id AND pp.status = 'active' LIMIT 1) AS active_plan_name,
    (SELECT pp.status FROM public.profile_plans pp WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial') LIMIT 1) AS active_plan_status,
    COALESCE((SELECT jsonb_object_agg(key, value) FROM public.profile_plans pp JOIN public.plans pl ON pl.id = pp.plan_id,
              jsonb_each(pl.permissions) AS perm(key, value) WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')), '{}'::jsonb) AS plan_permissions,
    COALESCE((SELECT jsonb_agg(DISTINCT perm) FROM (
      SELECT jsonb_array_elements(r.permissions) AS perm FROM public.profile_roles pr JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = p.id AND pr.is_active = TRUE
      UNION SELECT key AS perm FROM public.profile_plans pp JOIN public.plans pl ON pl.id = pp.plan_id,
      jsonb_each(pl.permissions) AS perm(key, value) WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')
    ) AS all_perms), '[]'::jsonb) AS all_permissions,
    EXISTS (SELECT 1 FROM public.profile_roles pr WHERE pr.user_id = p.id AND pr.is_active = TRUE) AS has_active_role,
    EXISTS (SELECT 1 FROM public.profile_plans pp WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial')) AS has_active_plan,
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = p.id)
     AND EXISTS (SELECT 1 FROM public.profile_roles pr WHERE pr.user_id = p.id AND pr.is_active = TRUE)
     AND EXISTS (SELECT 1 FROM public.profile_plans pp WHERE pp.user_id = p.id AND pp.status IN ('active', 'trial'))
    ) AS is_fully_setup
  FROM public.profiles p
  WHERE p.id = p_target_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.get_user_complete_data_admin IS 'جلب بيانات أي مستخدم (للإداريين فقط) - محمي';


-- =====================================================
-- ✅ End of File
-- =====================================================

-- Verify functions created successfully
SELECT
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_my_complete_data',
    'get_my_permissions',
    'do_i_have_permission',
    'get_my_setup_status',
    'get_user_complete_data_admin'
  )
ORDER BY routine_name;





-- جلب بياناتي فقط
-- const {  myData } = await supabase.rpc('get_my_complete_data');

-- جلب صلاحياتي فقط
-- const {  permissions } = await supabase.rpc('get_my_permissions');

-- التحقق من صلاحية
-- const {  hasPermission } = await supabase.rpc('do_i_have_permission', {
--   p_permission: 'products:create'
-- });


--  جلب بيانات مستخدم آخر (للإداريين فقط)
-- // ⚠️ يتطلب دور admin - سيرفض لغير الإداريين
-- const {  userData } = await supabase.rpc('get_user_complete_data_admin', {
--   p_target_user_id: 'other-user-id'
-- });

-- // إذا لم تكن مديرًا:
-- // ERROR: Access denied: Admin role required


-- get_my_complete_data
-- المستخدم الحالي فقط
-- ✅ آمن
-- get_my_permissions
-- المستخدم الحالي فقط
-- ✅ آمن
-- do_i_have_permission
-- المستخدم الحالي فقط
-- ✅ آمن
-- get_my_setup_status
-- المستخدم الحالي فقط
-- ✅ آمن
-- get_user_complete_data_admin
-- أي مستخدم
-- ✅ للإداريين فقط