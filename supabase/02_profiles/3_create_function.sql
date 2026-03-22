-- =====================================================
-- Marketna E-Commerce - Profiles Functions
-- File: 02_profiles_functions.sql
-- Version: 2.1
-- Date: 2026-03-22
-- Description: دوال إدارة البروفايل - دوال أساسية فقط
-- Dependencies: public.profiles, public.roles, public.subscription_plans,
--               public.profile_roles, public.profile_subscriptions, auth.users
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. دالة إنشاء البروفايل مع الدور والخطة (محسّنة)
-- 2. دالة تحديث آخر دخول (محسّنة)
-- =====================================================


-- =====================================================
-- 1️⃣ دالة إنشاء البروفايل مع الدور والخطة (محسّنة)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_role_id UUID;
  v_free_plan_id UUID;
BEGIN
  -- ─────────────────────────────────────────────────────
  -- الخطوة 1: إنشاء البروفايل
  -- ─────────────────────────────────────────────────────
  INSERT INTO public.profiles (
    id,
    email,
    provider,
    first_name,
    last_name,
    avatar_url,
    last_sign_in_at
  )
  VALUES (
    NEW.id,
    NEW.email,
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
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) DO NOTHING;

  -- ─────────────────────────────────────────────────────
  -- الخطوة 2: تعيين دور "customer" الافتراضي
  -- ─────────────────────────────────────────────────────
  SELECT id INTO v_customer_role_id
  FROM public.roles
  WHERE name = 'customer'
  LIMIT 1;

  IF v_customer_role_id IS NOT NULL THEN
    INSERT INTO public.profile_roles (user_id, role_id, is_active, granted_by)
    VALUES (NEW.id, v_customer_role_id, TRUE, NEW.id)
    ON CONFLICT (user_id, role_id) DO UPDATE
    SET is_active = TRUE, granted_at = NOW();
  END IF;

  -- ─────────────────────────────────────────────────────
  -- الخطوة 3: تعيين خطة "عضو مجاني" الافتراضية
  -- ─────────────────────────────────────────────────────
  SELECT id INTO v_free_plan_id
  FROM public.subscription_plans
  WHERE category = 'customer'
    AND is_default = TRUE
  LIMIT 1;

  IF v_free_plan_id IS NOT NULL THEN
    INSERT INTO public.profile_subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      trial_end_date
    )
    VALUES (
      NEW.id,
      v_free_plan_id,
      'active',
      NOW(),
      NULL,
      NULL
    )
    ON CONFLICT ON CONSTRAINT profile_subscriptions_pkey DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'إنشاء بروفايل مع دور customer وخطة عضو مجاني عند تسجيل مستخدم جديد';


-- =====================================================
-- 2️⃣ دالة تحديث آخر دخول (محسّنة)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث وقت آخر تسجيل الدخول فقط إذا تغير
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_sign_in_at = NEW.last_sign_in_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

COMMENT ON FUNCTION public.handle_user_login IS 'تحديث وقت آخر تسجيل دخول عند تسجيل الدخول';


-- =====================================================
-- تفعيل Trigger إنشاء المستخدم الجديد
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'ينشئ البروفايل والدور والخطة تلقائياً عند التسجيل';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

-- عرض معلومات الدوال
SELECT
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_user_login')
ORDER BY routine_name;

-- عرض معلومات الـ Triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_login');
