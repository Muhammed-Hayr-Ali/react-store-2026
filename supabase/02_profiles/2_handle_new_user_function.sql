-- =====================================================
-- Marketna E-Commerce - Profiles Functions
-- File: 02_profiles_functions.sql
-- Version: 7.0 (Final Production Version)
-- Date: 2026-03-22
-- Description: Profile management functions with auto-onboarding
-- Dependencies: public.profiles, public.roles, public.plans,
--               public.profile_roles, public.profile_plans, auth.users
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup (functions only - triggers via Dashboard)
-- 2. Create onboarding function (handle_new_user)
-- 3. Create login tracking function (handle_user_login)
-- 4. Grant permissions for auth system
-- 5. Trigger creation (with error handling)
-- 6. Verification & Dashboard instructions
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================
-- ⚠️ Note: Triggers on auth.users cannot be dropped via SQL Editor
-- They must be managed via Supabase Dashboard → Authentication → Triggers

-- Drop functions (CASCADE will remove dependent triggers if we own them)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;

-- Try to drop triggers (will fail in most Supabase environments - that's OK)
DO $$
BEGIN
  BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not drop triggers on auth.users (expected in Supabase).';
    RAISE NOTICE '📋 Please delete old triggers manually via Dashboard → Authentication → Triggers';
  END;
END $$;


-- =====================================================
-- 2️⃣ CREATE FUNCTIONS
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Function 1: Handle New User Signup (Onboarding)
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_role_id UUID;
  v_free_plan_id UUID;
BEGIN
  -- ──────────────────────────────────────────────────
  -- Step 1: Create/Update Profile
  -- ──────────────────────────────────────────────────
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
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
    NULLIF(
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ), 
      ''
    ),
    NEW.last_sign_in_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = NOW();

  -- ──────────────────────────────────────────────────
  -- Step 2: Assign 'customer' Role
  -- ──────────────────────────────────────────────────
  SELECT id INTO v_customer_role_id 
  FROM public.roles 
  WHERE name = 'customer'::role_name
  LIMIT 1;
  
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.profile_roles (user_id, role_id, is_active, granted_at, granted_by)
    VALUES (NEW.id, v_customer_role_id, TRUE, NOW(), NEW.id)
    ON CONFLICT (user_id, role_id) DO UPDATE
    SET 
      is_active = TRUE, 
      granted_at = NOW();
  ELSE
    RAISE WARNING '⚠️ Customer role not found for user: %', NEW.id;
  END IF;

  -- ──────────────────────────────────────────────────
  -- Step 3: Assign 'Free Member' Plan
  -- ──────────────────────────────────────────────────
  SELECT id INTO v_free_plan_id 
  FROM public.plans 
  WHERE category = 'customer'::plan_category 
    AND name = 'Free Member'
    AND is_default = TRUE 
  LIMIT 1;
  
  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO public.profile_plans (
      user_id, 
      plan_id, 
      status, 
      start_date, 
      end_date, 
      trial_end_date,
      updated_at
    )
    VALUES (
      NEW.id, 
      v_free_plan_id, 
      'active', 
      NOW(), 
      NULL,  -- lifetime
      NULL,
      NOW()
    )
    ON CONFLICT ON CONSTRAINT profile_plans_pkey DO NOTHING;
  ELSE
    RAISE WARNING '⚠️ Free Member plan not found for user: %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_new_user IS 'Auto-create profile + customer role + Free Member plan on user signup';


-- ─────────────────────────────────────────────────────
-- Function 2: Update Last Sign-in
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if last_sign_in_at actually changed
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET 
      last_sign_in_at = NEW.last_sign_in_at,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.handle_user_login IS 'Update profile last_sign_in_at when user logs in';


-- =====================================================
-- 3️⃣ GRANT PERMISSIONS
-- =====================================================
-- Required for Supabase Auth system to call these functions

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

GRANT EXECUTE ON FUNCTION public.handle_user_login() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO authenticated;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;


-- =====================================================
-- 4️⃣ CREATE TRIGGERS (With Error Handling)
-- =====================================================
-- ⚠️ These may fail in SQL Editor - create via Dashboard if needed

DO $$
BEGIN
  -- Try to create trigger for new user signup
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW 
        EXECUTE FUNCTION public.handle_new_user();
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create on_auth_user_created trigger via SQL.';
    RAISE NOTICE '📋 Please create manually via Dashboard (see instructions below).';
  END;

  -- Try to create trigger for user login
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_login'
    ) THEN
      CREATE TRIGGER on_auth_user_login
        AFTER UPDATE OF last_sign_in_at ON auth.users
        FOR EACH ROW 
        EXECUTE FUNCTION public.handle_user_login();
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create on_auth_user_login trigger via SQL.';
    RAISE NOTICE '📋 Please create manually via Dashboard (see instructions below).';
  END;
END $$;


-- =====================================================
-- 5️⃣ VERIFICATION
-- =====================================================

SELECT 
  '✅ Functions setup complete!' AS status,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('handle_new_user', 'handle_user_login')) AS functions_created,
  (SELECT COUNT(*) FROM information_schema.triggers 
   WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login')) AS triggers_created;

