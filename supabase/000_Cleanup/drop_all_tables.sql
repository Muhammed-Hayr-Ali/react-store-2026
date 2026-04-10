-- =====================================================
-- 🗑️ CLEANUP SCRIPT - Drop All Tables, Policies, Functions, Triggers, Types
-- =====================================================
-- ⚠️ هذا الملف يحذف كل الجداول والسياسات والدوال والمشغلات والأنواع
--    استخدمه قبل تشغيل schema الجديد
-- =====================================================
-- 🔴 تحذير: هذا سيحذف كل البيانات نهائياً!
-- =====================================================

-- =====================================================
-- 1️⃣ DROP ALL TRIGGERS - حذف جميع المشغلات (ديناميكي)
-- =====================================================
-- نحذف جميع المشغلات ديناميكياً لضمان عدم نسيان أي منها

DO $$
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS %I ON %I CASCADE',
            trig.trigger_name,
            trig.event_object_table
        );
    END LOOP;
END $$;

-- حذف المشغلات المعروفة يدوياً (احتياطي)
DROP TRIGGER IF EXISTS "trigger_core_profile_updated" ON "core_profile" CASCADE;
DROP TRIGGER IF EXISTS "trigger_store_vendor_updated" ON "store_vendor" CASCADE;
DROP TRIGGER IF EXISTS "trigger_store_category_updated" ON "store_category" CASCADE;
DROP TRIGGER IF EXISTS "trigger_store_product_updated" ON "store_product" CASCADE;
DROP TRIGGER IF EXISTS "trigger_product_image_updated" ON "product_image" CASCADE;
DROP TRIGGER IF EXISTS "trigger_trade_order_updated" ON "trade_order" CASCADE;
DROP TRIGGER IF EXISTS "trigger_fleet_driver_updated" ON "fleet_driver" CASCADE;
DROP TRIGGER IF EXISTS "trigger_fleet_delivery_updated" ON "fleet_delivery" CASCADE;
DROP TRIGGER IF EXISTS "trigger_social_review_updated" ON "social_review" CASCADE;
DROP TRIGGER IF EXISTS "trigger_support_ticket_updated" ON "support_ticket" CASCADE;
DROP TRIGGER IF EXISTS "trigger_ticket_message_updated" ON "ticket_message" CASCADE;
DROP TRIGGER IF EXISTS "trigger_sys_notification_updated" ON "sys_notification" CASCADE;
DROP TRIGGER IF EXISTS "trigger_system_error_log_updated" ON "system_error_log" CASCADE;
DROP TRIGGER IF EXISTS "trigger_exchange_rates_updated" ON "exchange_rates" CASCADE;
DROP TRIGGER IF EXISTS "trigger_saas_plan_updated" ON "saas_plan" CASCADE;
DROP TRIGGER IF EXISTS "trigger_saas_subscription_updated" ON "saas_subscription" CASCADE;
DROP TRIGGER IF EXISTS "trigger_auth_password_reset_updated" ON "auth_password_reset" CASCADE;
DROP TRIGGER IF EXISTS "trigger_upgrade_requests_updated" ON "upgrade_requests" CASCADE;
DROP TRIGGER IF EXISTS "update_product_image_updated_at" ON "product_image" CASCADE;
DROP TRIGGER IF EXISTS "update_product_variant_updated_at" ON "product_variant" CASCADE;

-- =====================================================
-- 2️⃣ DROP ALL DATABASE FUNCTIONS - حذف جميع الدوال (ديناميكي)
-- =====================================================
-- نحذف جميع الدوال ديناميكياً لضمان عدم نسيان أي دالة

DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT n.nspname as schema_name,
               p.proname as function_name,
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
          AND n.nspname = 'public'
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
            func.schema_name,
            func.function_name,
            func.args
        );
    END LOOP;
END $$;

-- حذف الدوال المعروفة يدوياً (احتياطي)

-- Notification Functions
DROP FUNCTION IF EXISTS "get_user_notifications" CASCADE;
DROP FUNCTION IF EXISTS "get_unread_count" CASCADE;
DROP FUNCTION IF EXISTS "mark_notification_read" CASCADE;
DROP FUNCTION IF EXISTS "mark_all_notifications_read" CASCADE;
DROP FUNCTION IF EXISTS "create_notification" CASCADE;
DROP FUNCTION IF EXISTS "create_bulk_notifications" CASCADE;
DROP FUNCTION IF EXISTS "cleanup_old_notifications" CASCADE;
DROP FUNCTION IF EXISTS "get_new_notifications_since" CASCADE;
DROP FUNCTION IF EXISTS "notify_new_order" CASCADE;
DROP FUNCTION IF EXISTS "notify_new_ticket_message" CASCADE;

-- Password Reset Functions
DROP FUNCTION IF EXISTS "create_password_reset_token" CASCADE;
DROP FUNCTION IF EXISTS "claim_password_reset_token" CASCADE;
DROP FUNCTION IF EXISTS "verify_password_reset_token" CASCADE;

-- Profile Functions
DROP FUNCTION IF EXISTS "get_user_full_profile" CASCADE;
DROP FUNCTION IF EXISTS "get_user_profile" CASCADE;
DROP FUNCTION IF EXISTS "get_user_roles" CASCADE;
DROP FUNCTION IF EXISTS "has_role" CASCADE;
DROP FUNCTION IF EXISTS "has_permission" CASCADE;

-- Utility Functions
DROP FUNCTION IF EXISTS "update_updated_at_column" CASCADE;
DROP FUNCTION IF EXISTS "handle_new_user" CASCADE;
DROP FUNCTION IF EXISTS "handle_user_update" CASCADE;

-- =====================================================
-- 3️⃣ DROP TABLES (Reverse Order) - حذف الجداول
-- =====================================================

-- Module 10: Upgrade
DROP TABLE IF EXISTS "upgrade_requests" CASCADE;

-- Module 9: System
DROP TABLE IF EXISTS "system_error_log" CASCADE;
DROP TABLE IF EXISTS "sys_notification" CASCADE;

-- Module 8: Support
DROP TABLE IF EXISTS "ticket_message" CASCADE;
DROP TABLE IF EXISTS "support_ticket" CASCADE;

-- Module 7: Social
DROP TABLE IF EXISTS "customer_favorite" CASCADE;
DROP TABLE IF EXISTS "social_review" CASCADE;

-- Module 6: Fleet
DROP TABLE IF EXISTS "fleet_delivery" CASCADE;
DROP TABLE IF EXISTS "fleet_driver" CASCADE;

-- Module 5: Trade
DROP TABLE IF EXISTS "trade_order_item" CASCADE;
DROP TABLE IF EXISTS "trade_order" CASCADE;

-- Module 4: Store
DROP TABLE IF EXISTS "product_variant" CASCADE;
DROP TABLE IF EXISTS "product_image" CASCADE;
DROP TABLE IF EXISTS "store_product" CASCADE;
DROP TABLE IF EXISTS "store_category" CASCADE;
DROP TABLE IF EXISTS "store_vendor" CASCADE;

-- Module 3: SaaS
DROP TABLE IF EXISTS "saas_subscription" CASCADE;
DROP TABLE IF EXISTS "saas_plan" CASCADE;

-- Module 2: Exchange Rates
DROP TABLE IF EXISTS "exchange_rates" CASCADE;

-- Module 1: Core
DROP TABLE IF EXISTS "core_address" CASCADE;
DROP TABLE IF EXISTS "core_profile_role" CASCADE;
DROP TABLE IF EXISTS "core_role" CASCADE;
DROP TABLE IF EXISTS "auth_password_reset" CASCADE;
DROP TABLE IF EXISTS "core_profile" CASCADE;

-- =====================================================
-- 4️⃣ DROP RLS POLICIES - حذف سياسات الأمان
-- =====================================================
-- ⚠️ معظم السياسات تم حذفها مع الجداول عبر CASCADE
--    لكن نحذف أي سياسات متبقية احتياطياً

-- Policy cleanup (if any survived CASCADE)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname,
            pol.schemaname,
            pol.tablename
        );
    END LOOP;
END $$;

-- =====================================================
-- 5️⃣ DROP ALL ENUM TYPES - حذف جميع الأنواع (ديناميكي)
-- =====================================================
-- نحذف جميع أنواع ENUM ديناميكياً لضمان عدم نسيان أي نوع

DO $$
DECLARE
    typ RECORD;
BEGIN
    FOR typ IN
        SELECT typname
        FROM pg_type
        JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
        JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public'
        GROUP BY typname
    LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', typ.typname);
    END LOOP;
END $$;

-- حذف الأنواع المعروفة يدوياً (احتياطي)
DROP TYPE IF EXISTS "delivery_status" CASCADE;
DROP TYPE IF EXISTS "vendor_status" CASCADE;
DROP TYPE IF EXISTS "role_name" CASCADE;
DROP TYPE IF EXISTS "plan_category" CASCADE;
DROP TYPE IF EXISTS "sub_status" CASCADE;
DROP TYPE IF EXISTS "notify_type" CASCADE;
DROP TYPE IF EXISTS "order_status" CASCADE;
DROP TYPE IF EXISTS "ticket_status" CASCADE;
DROP TYPE IF EXISTS "ticket_priority" CASCADE;
DROP TYPE IF EXISTS "error_severity" CASCADE;
DROP TYPE IF EXISTS "payment_method" CASCADE;
DROP TYPE IF EXISTS "payment_status" CASCADE;

-- =====================================================
-- 6️⃣ DROP EXTENSIONS - حذف الامتدادات
-- =====================================================

DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- =====================================================
-- 7️⃣ DROP SCHEMA - حذف المخطط (اختياري)
-- =====================================================

-- ⚠️ لا تحذف الـ schema إلا إذا كنت متأكداً
-- DROP SCHEMA IF EXISTS "public" CASCADE;
-- CREATE SCHEMA "public";

-- =====================================================
-- ✅ CLEANUP COMPLETE
-- =====================================================
-- تم حذف:
-- - ✅ جميع المشغلات (ديناميكي + يدوي احتياطي)
-- - ✅ جميع الدوال والـ RPC functions (ديناميكي + يدوي احتياطي)
-- - ✅ جميع الجداول (23 جدول)
-- - ✅ جميع سياسات RLS (ديناميكي)
-- - ✅ جميع أنواع ENUM (ديناميكي + يدوي احتياطي)
-- - ✅ الامتدادات
-- =====================================================
-- 📝 الخطوة التالية:
--    تشغيل ملف 001_schema_single_merchant.sql
-- =====================================================
