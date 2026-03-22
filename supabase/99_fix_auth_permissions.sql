-- =====================================================
-- Marketna E-Commerce - Fix Auth Users Permissions
-- File: 99_fix_auth_permissions.sql
-- Version: 4.2
-- Date: 2026-03-22
-- Description: Fix permissions for auth.users triggers
-- =====================================================
-- ⚠️ IMPORTANT: This file must be executed by postgres/supabase_admin user
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- 1️⃣ CLEANUP - Remove old triggers and functions
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;


-- =====================================================
-- 2️⃣ GRANT PERMISSIONS
-- =====================================================

-- Grant execute permission to the functions that need to access auth.users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO supabase_auth_admin;

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;


-- =====================================================
-- 3️⃣ RECREATE FUNCTIONS (if not already created)
-- =====================================================
-- Note: These functions should already exist from 02_profiles/3_create_function.sql
-- This section is a fallback in case they need to be recreated here

-- Function 1: Handle New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_role_id UUID;
  v_free_plan_id UUID;
BEGIN
  -- Create/Update profile
  INSERT INTO public.profiles (
    id,
    email,
    provider,
    first_name,
    last_name,
    avatar_url,
    last_sign_in_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    CASE
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL AND NEW.raw_user_meta_data->>'first_name' <> ''
        THEN NEW.raw_user_meta_data->>'first_name'
      WHEN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name') <> ''
        THEN SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), ' ', 1)
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'last_name' IS NOT NULL AND NEW.raw_user_meta_data->>'last_name' <> ''
        THEN NEW.raw_user_meta_data->>'last_name'
      WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) > 0
        THEN TRIM(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
                     FROM POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) + 1))
      ELSE NULL
    END,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
      NULLIF(NEW.raw_user_meta_data->>'picture', ''),
      NULL
    ),
    NEW.last_sign_in_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = NOW();

  -- Assign 'customer' role
  SELECT id INTO v_customer_role_id FROM public.roles WHERE name::text = 'customer' LIMIT 1;
  
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.profile_roles (user_id, role_id, is_active, granted_at, granted_by)
    VALUES (NEW.id, v_customer_role_id, TRUE, NOW(), NEW.id)
    ON CONFLICT (user_id, role_id) DO UPDATE
    SET is_active = TRUE, granted_at = NOW();
  END IF;

  -- Assign default plan
  SELECT id INTO v_free_plan_id FROM public.plans 
  WHERE category::text = 'customer' AND is_default = TRUE LIMIT 1;
  
  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO public.profile_plans (user_id, plan_id, status, start_date, updated_at)
    VALUES (NEW.id, v_free_plan_id, 'active', NOW(), NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function 2: Update Last Sign-in
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_sign_in_at = NEW.last_sign_in_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- =====================================================
-- 4️⃣ RECREATE TRIGGERS
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();


-- =====================================================
-- 5️⃣ VERIFY SETUP
-- =====================================================

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login');

-- Check function permissions
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_user_login');

-- Check roles data
SELECT name, description FROM public.roles ORDER BY name;

-- Check plans data
SELECT category, name, price, is_default FROM public.plans ORDER BY category, name;


-- =====================================================
-- ✅ Setup complete!
-- =====================================================
-- New users will now automatically get:
-- 1. A profile in public.profiles
-- 2. The 'customer' role via public.profile_roles
-- 3. The 'Free Member' plan via public.profile_plans
-- =====================================================
