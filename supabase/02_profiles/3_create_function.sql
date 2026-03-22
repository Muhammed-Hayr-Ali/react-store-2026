-- =====================================================
-- Marketna E-Commerce - Profiles Functions
-- File: 02_profiles_functions.sql
-- Version: 6.0 (Final Production Version)
-- Date: 2026-03-22
-- Description: Profile management functions with permissions and robust error handling
-- Dependencies: public.profiles, public.roles, public.plans,
--               public.profile_roles, public.profile_plans, auth.users
-- =====================================================

-- 1️⃣ CLEANUP
-- ملاحظة: قد تفشل عملية حذف التريجرز إذا لم تكن المالك لجدول auth.users في بعض بيئات Supabase.
-- لذا نستخدم DO block لتجاوز الأخطاء إذا لم تكن الصلاحيات كافية، مع التركيز على تحديث الدوال.
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop triggers on auth.users due to permissions. Skipping...';
    END;
END $$;

-- حذف الدوال القديمة (هذا آمن دائماً للمالك)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;


-- 2️⃣ CREATE FUNCTIONS
-- إنشاء الدوال قبل منح الصلاحيات أو إنشاء التريجرز

-- Function 1: Handle New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_role_id UUID;
  v_free_plan_id UUID;
BEGIN
  -- الخطوة 1: إنشاء الملف الشخصي (Profile)
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
    COALESCE(NEW.email, ''), -- الحقل NOT NULL في الجدول
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

  -- الخطوة 2: تعيين دور 'customer'
  -- نحول name إلى text للمقارنة مع USER-DEFINED enum
  SELECT id INTO v_customer_role_id FROM public.roles WHERE name::text = 'customer' LIMIT 1;
  
  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.profile_roles (user_id, role_id, is_active, granted_at, granted_by)
    VALUES (NEW.id, v_customer_role_id, TRUE, NOW(), NEW.id)
    ON CONFLICT (user_id, role_id) DO UPDATE
    SET is_active = TRUE, granted_at = NOW();
  END IF;

  -- الخطوة 3: تعيين الخطة الافتراضية
  -- نحول category إلى text للمقارنة مع USER-DEFINED enum
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


-- 3️⃣ GRANT PERMISSIONS
-- منح الصلاحيات للدوال المنشأة
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_user_login() TO supabase_auth_admin;

-- منح صلاحيات الوصول للمخطط والجداول لمستخدم المصادقة
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;


-- 4️⃣ CREATE TRIGGERS
-- نستخدم DO block لإنشاء التريجرز فقط إذا لم تكن موجودة، لتجنب مشاكل الصلاحيات في الحذف.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_login') THEN
        CREATE TRIGGER on_auth_user_login
          AFTER UPDATE OF last_sign_in_at ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not manage triggers on auth.users. Please ensure you have sufficient permissions or triggers already exist.';
END $$;


-- 5️⃣ VERIFY SETUP
-- استعلامات اختيارية للتأكد من الحالة
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login');
SELECT routine_name, security_type FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('handle_new_user', 'handle_user_login');
