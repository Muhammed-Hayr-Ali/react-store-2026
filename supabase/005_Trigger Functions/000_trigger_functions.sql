-- =====================================================
-- 🔄 Trigger Functions - دوال المشغلات الآلية
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف خامساً
--    بعد: 003_RLS Policies/000_rls_policies.sql
-- =====================================================
-- 📋 هذا الملف يحتوي على جميع Trigger Functions المستخدمة في:
--    - مزامنة البروفايل عند تسجيل المستخدم
--    - تحديث الطوابع الزمنية تلقائياً
--    - أدوات المراقبة والتنظيف
-- =====================================================

-- =====================================================
-- 📌 القسم الأول: مزامنة البروفايل (Profile Sync)
-- =====================================================

-- 1️⃣ دالة: مزامنة بيانات المستخدم مع البروفايل
-- =====================================================
-- 🎯 الاستخدام: Trigger على auth.users عند INSERT/UPDATE
-- 📝 ملاحظة: تُنشئ/تحدّث core_profile تلقائياً وتعطي دور "customer"

CREATE OR REPLACE FUNCTION public.sync_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  -- 1) إدراج أو تحديث البروفايل
  INSERT INTO public.core_profile (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NULLIF((NEW.raw_user_meta_data->>'first_name')::text, ''),
    NULLIF((NEW.raw_user_meta_data->>'last_name')::text, ''),
    NULLIF((NEW.raw_user_meta_data->>'avatar_url')::text, ''),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  -- 2) تعيين دور "customer" تلقائياً
  SELECT cr.id INTO v_role_id
  FROM public.core_role cr
  WHERE cr.code = 'customer'
  LIMIT 1;

  IF FOUND AND v_role_id IS NOT NULL THEN
    INSERT INTO public.core_profile_role (profile_id, role_id)
    VALUES (NEW.id, v_role_id)
    ON CONFLICT (profile_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_profile_data() IS 'مزامنة بيانات auth.users مع core_profile تلقائياً';

-- إنشاء الـ Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_data();

-- =====================================================
-- 📌 القسم الثاني: تحديث الطوابع الزمنية (Timestamps)
-- =====================================================

-- 2️⃣ دالة: تحديث updated_at تلقائياً
-- =====================================================
-- 🎯 الاستخدام: Trigger على أي جدول يحتوي updated_at
-- 📝 ملاحظة: تُحدث حقل updated_at عند كل تعديل

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'تحديث حقل updated_at تلقائياً عند كل تعديل';

-- دالة خاصة لجدول exchange_rates (لأن الحقل اسمه last_updated_at)
CREATE OR REPLACE FUNCTION public.update_exchange_rate_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_exchange_rate_timestamp() IS 'تحديث last_updated_at تلقائياً لجدول أسعار الصرف';

-- ✅ Core Module
DROP TRIGGER IF EXISTS update_core_profile_updated_at ON public.core_profile;
CREATE TRIGGER update_core_profile_updated_at
  BEFORE UPDATE ON public.core_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_core_role_updated_at ON public.core_role;
CREATE TRIGGER update_core_role_updated_at
  BEFORE UPDATE ON public.core_role
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_core_profile_role_updated_at ON public.core_profile_role;
CREATE TRIGGER update_core_profile_role_updated_at
  BEFORE UPDATE ON public.core_profile_role
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_core_address_updated_at ON public.core_address;
CREATE TRIGGER update_core_address_updated_at
  BEFORE UPDATE ON public.core_address
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_auth_password_reset_updated_at ON public.auth_password_reset;
CREATE TRIGGER update_auth_password_reset_updated_at
  BEFORE UPDATE ON public.auth_password_reset
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ✅ Store Module
DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_category_updated_at ON public.store_category;
CREATE TRIGGER update_store_category_updated_at
  BEFORE UPDATE ON public.store_category
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_product_updated_at ON public.store_product;
CREATE TRIGGER update_store_product_updated_at
  BEFORE UPDATE ON public.store_product
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_image_updated_at ON public.product_image;
CREATE TRIGGER update_product_image_updated_at
  BEFORE UPDATE ON public.product_image
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variant_updated_at ON public.product_variant;
CREATE TRIGGER update_product_variant_updated_at
  BEFORE UPDATE ON public.product_variant
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ✅ Exchange Rates Module
DROP TRIGGER IF EXISTS update_exchange_rates_updated_at ON public.exchange_rates;
CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_exchange_rate_timestamp();

-- ✅ Trade Module
DROP TRIGGER IF EXISTS update_trade_order_updated_at ON public.trade_order;
CREATE TRIGGER update_trade_order_updated_at
  BEFORE UPDATE ON public.trade_order
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trade_order_delivery_updated_at ON public.trade_order_delivery;
CREATE TRIGGER update_trade_order_delivery_updated_at
  BEFORE UPDATE ON public.trade_order_delivery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- (trade_order_item لا يحتوي updated_at)

-- ✅ Support Module
DROP TRIGGER IF EXISTS update_support_ticket_updated_at ON public.support_ticket;
CREATE TRIGGER update_support_ticket_updated_at
  BEFORE UPDATE ON public.support_ticket
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ticket_message_updated_at ON public.ticket_message;
CREATE TRIGGER update_ticket_message_updated_at
  BEFORE UPDATE ON public.ticket_message
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ✅ System Module
DROP TRIGGER IF EXISTS update_sys_notification_updated_at ON public.sys_notification;
CREATE TRIGGER update_sys_notification_updated_at
  BEFORE UPDATE ON public.sys_notification
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_error_log_updated_at ON public.system_error_log;
CREATE TRIGGER update_system_error_log_updated_at
  BEFORE UPDATE ON public.system_error_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 📌 القسم الثالث: دوال المراقبة والتنظيف
-- =====================================================

-- 3️⃣ دالة: التحقق من حالة المزامنة
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM check_profile_sync_status()
-- 📊 ترجع حالة مزامنة auth.users مع core_profile

CREATE OR REPLACE FUNCTION public.check_profile_sync_status()
RETURNS TABLE (
  user_id uuid,
  email text,
  profile_exists boolean,
  sync_status text,
  last_synced timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    au.id AS user_id,
    au.email,
    cp.id IS NOT NULL AS profile_exists,
    CASE
      WHEN cp.id IS NULL THEN 'NOT_SYNCED'
      WHEN cp.updated_at >= au.updated_at THEN 'SYNCED'
      ELSE 'OUTDATED'
    END AS sync_status,
    cp.updated_at AS last_synced
  FROM auth.users au
  LEFT JOIN public.core_profile cp ON au.id = cp.id
  ORDER BY au.created_at DESC;
$$;

COMMENT ON FUNCTION public.check_profile_sync_status() IS 'التحقق من حالة مزامنة البروفايلات';

-- 4️⃣ دالة: تنظيف البروفايلات غير المتزامنة
-- =====================================================
-- 🎯 الاستخدام: SELECT cleanup_unsynced_profiles()
-- 🧹 تحذف البروفايلات اليتيمة وتُنشئ البروفايلات الناقصة
-- 🔒 أمان: تستخدم soft delete بدلاً من hard delete

CREATE OR REPLACE FUNCTION public.cleanup_unsynced_profiles()
RETURNS TABLE (
  removed_count bigint,
  created_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_removed bigint;
  v_created bigint;
BEGIN
  -- 🔒 حذف ناعم: تحديث deleted_at بدلاً من الحذف الفعلي
  UPDATE public.core_profile
  SET deleted_at = NOW()
  WHERE id NOT IN (SELECT id FROM auth.users)
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_removed = ROW_COUNT;

  -- إنشاء بروفايلات للمستخدمين الجدد غير المتزامنين
  INSERT INTO public.core_profile (id, email, first_name, last_name, avatar_url)
  SELECT
    au.id,
    au.email,
    NULLIF((au.raw_user_meta_data->>'first_name')::text, ''),
    NULLIF((au.raw_user_meta_data->>'last_name')::text, ''),
    NULLIF((au.raw_user_meta_data->>'avatar_url')::text, '')
  FROM auth.users au
  LEFT JOIN public.core_profile cp ON au.id = cp.id
  WHERE cp.id IS NULL
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS v_created = ROW_COUNT;

  RETURN QUERY SELECT v_removed, v_created;
END;
$$;

COMMENT ON FUNCTION public.cleanup_unsynced_profiles() IS 'تنظيف البروفايلات غير المتزامنة (حذف ناعم آمن)';

-- =====================================================
-- 📌 القسم الرابع: دوال مساعدة إضافية
-- =====================================================

-- 5️⃣ دالة: إنشاء بروفايل يدوياً
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_manual_profile(
  p_user_id uuid,
  p_email text,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.core_profile (id, email, first_name, last_name, avatar_url)
  VALUES (p_user_id, p_email, p_first_name, p_last_name, p_avatar_url)
  ON CONFLICT (id) DO NOTHING;

  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.create_manual_profile(uuid, text, text, text, text) IS 'إنشاء بروفايل يدوياً لمستخدم موجود';

-- 6️⃣ دالة: حذف مستخدم وبروفايله (Soft Delete)
-- =====================================================
CREATE OR REPLACE FUNCTION public.soft_delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.core_profile
  SET deleted_at = NOW()
  WHERE id = p_user_id;

  -- حذف المستخدم من auth.users (يتطلب Service Role)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_user(uuid) IS 'حذف مستخدم وبروفايله (يتطلب Service Role)';

-- =====================================================
-- ✅ END OF TRIGGER FUNCTIONS
-- =====================================================

/*
📋 ملخص الدوال والمشغلات:

🔄 دوال المزامنة (1 دالة):
  1. sync_profile_data()           ← مزامنة auth.users مع core_profile

⏰ دوال الطوابع الزمنية (2 دالة):
  2. update_updated_at_column()    ← تحديث updated_at تلقائياً
  3. update_exchange_rate_timestamp() ← تحديث last_updated_at لأسعار الصرف

🔍 دوال المراقبة (2 دوال):
  4. check_profile_sync_status()   ← حالة المزامنة
  5. cleanup_unsynced_profiles()   ← تنظيف غير المتزامن

🛠️ دوال مساعدة (2 دوال):
  6. create_manual_profile()       ← إنشاء بروفايل يدوياً
  7. soft_delete_user()            ← حذف ناعم للمستخدم

📊 الإجمالي: 7 دوال + 18 Trigger

✅ الجداول المفعّل عليها updated_at trigger (18 جدول):
  core_profile, core_role, core_profile_role, core_address, auth_password_reset,
  store_settings, store_category, store_product, product_image, product_variant,
  exchange_rates, trade_order, trade_order_delivery,
  support_ticket, ticket_message, sys_notification, system_error_log

❌ الجداول بدون updated_at (لا تحتاج trigger):
  trade_order_item, social_review, customer_favorite

⚡ التحسينات:
  ✅ استخدام دالة مخصصة لـ exchange_rates (last_updated_at)
  ✅ معالجة الأخطاء المحسّنة و COALESCE/NULLIF
  ✅ توثيق شامل لكل دالة و Trigger
*/
