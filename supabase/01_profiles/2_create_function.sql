-- =====================================================
-- Marketna E-Commerce - Profiles Functions
-- File: 01_profiles/2_create_function.sql
-- Version: 7.2 (Final Audited - Phase 1 Last)
-- Date: 2026-03-22
-- Description: Profile management functions with auto-onboarding
-- Dependencies: public.profiles, public.roles, public.plans,
--               public.profile_roles, public.profile_plans, auth.users
-- =====================================================

-- ⚠️ CRITICAL: This file MUST be executed LAST in Phase 1
-- All tables must exist before running this file

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Cleanup (functions only)
-- 2. Create onboarding function (handle_new_user)
-- 3. Create login tracking function (handle_user_login)
-- 4. Grant permissions for auth system
-- 5. Trigger creation (with error handling)
-- 6. Verification & Dashboard instructions
-- =====================================================


-- =====================================================
-- 1️⃣ CLEANUP
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;

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
  WHERE name = 'customer'::public.role_name
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
  WHERE category = 'customer'::public.plan_category 
    AND name = 'Free Member'
    AND is_default = TRUE 
  LIMIT 1;
  
  IF v_free_plan_id IS NOT NULL THEN
    -- Check for existing active plan before inserting
    IF NOT EXISTS (
      SELECT 1 FROM public.profile_plans 
      WHERE user_id = NEW.id 
        AND plan_id = v_free_plan_id 
        AND status IN ('active', 'trial')
    ) THEN
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
        NULL,
        NULL,
        NOW()
      );
    END IF;
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

-- 🔹 Triggers only need supabase_auth_admin access
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
-- 🔹 Removed: authenticated (not needed for triggers)

GRANT EXECUTE ON FUNCTION public.handle_user_login() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO supabase_auth_admin;
-- 🔹 Removed: authenticated (not needed for triggers)

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- 🔹 Explicit grants for critical tables
GRANT SELECT, INSERT, UPDATE ON public.profiles TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE ON public.profile_roles TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE ON public.profile_plans TO supabase_auth_admin;
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.plans TO supabase_auth_admin;


-- =====================================================
-- 4️⃣ CREATE TRIGGERS (With Error Handling)
-- =====================================================

DO $$
BEGIN
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
    RAISE NOTICE '📋 Please create manually via Dashboard → Authentication → Triggers';
    RAISE NOTICE '📋 Function: public.handle_new_user()';
  END;

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
    RAISE NOTICE '📋 Please create manually via Dashboard → Authentication → Triggers';
    RAISE NOTICE '📋 Function: public.handle_user_login()';
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


-- =====================================================
-- 6️⃣ PHASE 1 COMPLETION CHECKLIST
-- =====================================================
/*
✅ PHASE 1 - Execution Order (MUST follow this order):

┌───┬──────────────────────────────────────┬──────────┐
│ # │ File                                 │ Status   │
├───┼──────────────────────────────────────┼──────────┤
│ 1 │ 01_profiles/1_create_table.sql       │ ✅ First │
│ 2 │ 02_password_reset/1_create_table.sql │ ✅       │
│ 3 │ 03_roles/1_create_table.sql          │ ✅       │
│ 4 │ 04_profile_roles_links/1_table.sql   │ ✅       │
│ 5 │ 05_subscription_plans/1_table.sql    │ ✅       │
│ 6 │ 06_profile_plans_links/1_table.sql   │ ✅       │
│ 7 │ 01_profiles/2_create_function.sql    │ ✅ Last  │
└───┴──────────────────────────────────────┴──────────┘

📋 PHASE 2 - Admin Policies (After Phase 1 complete):

┌───┬──────────────────────────────────────┐
│ # │ File                                 │
├───┼──────────────────────────────────────┤
│ 1 │ 10_profiles_admin_policies.sql       │
│ 2 │ 11_profile_roles_admin_policies.sql  │
│ 3 │ 12_profile_plans_admin_policies.sql  │
│ 4 │ 13_password_reset_admin_policies.sql │
└───┴──────────────────────────────────────┘

⚠️ IMPORTANT: 
- Run Phase 1 files in order (1-8)
- Verify each file completes successfully
- Then run Phase 2 files for admin policies
*/


-- =====================================================
-- 7️⃣ DASHBOARD INSTRUCTIONS (If triggers fail)
-- =====================================================
/*
📋 MANUAL TRIGGER CREATION (Supabase Dashboard):

1. Go to: Database → Triggers
2. Click "New Trigger"
3. For on_auth_user_created:
   - Name: on_auth_user_created
   - Table: auth.users
   - Timing: AFTER
   - Event: INSERT
   - Function: public.handle_new_user()

4. For on_auth_user_login:
   - Name: on_auth_user_login
   - Table: auth.users
   - Timing: AFTER
   - Event: UPDATE (last_sign_in_at)
   - Function: public.handle_user_login()
*/