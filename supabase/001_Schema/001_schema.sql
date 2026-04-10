-- =====================================================
-- 🚀 Single-Merchant E-Commerce Database Schema
-- PostgreSQL 14+ | UTF-8 | Production Ready
-- =====================================================
-- ⚠️ ترتيب التنفيذ: هذا الملف يجب أن يُنفَّذ أولاً
-- =====================================================
-- 📋 ترتيب تشغيل الملفات الكامل:
--    1. ✅ 001_Schema/001_schema.sql                 ← هذا الملف (الجداول والعلاقات)
--    2. ✅ 002_Utility Functions/000_utility_functions.sql  ← الدوال المساعدة
--    3. ✅ 003_RLS Policies/000_rls_policies.sql     ← سياسات الأمان
--    4. ✅ 004_Seed Data/001_role_seed.sql            ← بيانات الأدوار
--    5. ✅ 005_Trigger Functions/000_trigger_functions.sql  ← المشغلات الآلية
--    6. ✅ 005_Trigger Functions/002_create_test_user.sql   ← مستخدمين اختباريين
--    7. ✅ 006_Tests/001_test_rls_policies.sql        ← اختبار السياسات
-- =====================================================
-- 📝 ملاحظات:
--    - أضيفت أعمدة updated_at لـ: product_image, product_variant, ticket_message
--    - إجمالي الجداول: 20 جدول | إجمالي الـ triggers: 18
-- =====================================================

-- تمكين امتداد UUID (مطلوب لـ gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1️⃣ ENUM TYPES - أنواع البيانات الثابتة
-- =====================================================

CREATE TYPE "role_name" AS ENUM (
  'admin', 'vendor', 'customer', 'delivery', 'support'
);

CREATE TYPE "notify_type" AS ENUM (
  'order_event', 'system_alert', 'promo', 'review', 'ticket'
);

CREATE TYPE "order_status" AS ENUM (
  'pending', 'confirmed', 'processing', 'out_for_delivery',
  'delivered', 'cancelled'
);

CREATE TYPE "delivery_status" AS ENUM (
  'pending', 'out_for_delivery', 'delivered', 'failed', 'returned'
);

CREATE TYPE "ticket_status" AS ENUM (
  'open', 'in_progress', 'resolved', 'closed'
);

CREATE TYPE "ticket_priority" AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE "error_severity" AS ENUM (
  'info', 'warning', 'error', 'critical'
);

CREATE TYPE "payment_method" AS ENUM (
  'cod'
);

CREATE TYPE "payment_status" AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);

-- =====================================================
-- 2️⃣ CORE MODULE - المستخدمين والصلاحيات
-- =====================================================

CREATE TABLE "core_profile" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) UNIQUE NOT NULL,
  "first_name" text,
  "last_name" text,
  "full_name" text GENERATED ALWAYS AS (
    trim(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
  ) STORED,
  "avatar_url" text,
  "phone_number" varchar(20) UNIQUE,
  "is_phone_verified" boolean DEFAULT false,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "auth_password_reset" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "email" text NOT NULL,
  "token" text UNIQUE NOT NULL CHECK (length(token) = 64),
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "is_revoked" boolean DEFAULT false,
  "ip_address" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "core_role" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" role_name UNIQUE NOT NULL,
  "description" text,
  "permissions" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "core_profile_role" (
  "profile_id" uuid,
  "role_id" uuid,
  "assigned_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("profile_id", "role_id")
);

CREATE TABLE "core_address" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "title_ar" text NOT NULL,
  "address_details" text NOT NULL,
  "latitude" numeric(10, 6),
  "longitude" numeric(10, 6),
  "is_default" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 🏪 STORE SETTINGS - إعدادات المتجر الواحد
-- =====================================================

CREATE TABLE "store_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name_ar" text NOT NULL,
  "name_en" text,
  "description_ar" text,
  "description_en" text,
  "email" text,
  "phone" text,
  "address" text,
  "city" text,
  "latitude" numeric(10, 6),
  "longitude" numeric(10, 6),
  "default_currency" varchar(3) DEFAULT 'USD' CHECK (default_currency ~ '^[A-Z]{3}$'),
  "logo_url" text,
  "banner_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 💱 EXCHANGE RATES MODULE - أسعار الصرف
-- =====================================================

CREATE TABLE "exchange_rates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "currency_code" varchar(3) UNIQUE NOT NULL CHECK (currency_code ~ '^[A-Z]{3}$'),
  "rate_from_usd" numeric(18, 6) NOT NULL CHECK (rate_from_usd > 0),
  "last_updated_at" timestamptz NOT NULL DEFAULT now(),
  "created_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 🛍️ STORE MODULE - المنتجات والتصنيفات (تاجر واحد)
-- =====================================================

CREATE TABLE "store_category" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_id" uuid,
  "name_ar" text NOT NULL,
  "name_en" text,
  "slug" text NOT NULL,
  "is_active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "store_product" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" uuid,
  "user_id" uuid,  -- Owner of the product (for future multi-vendor)
  "name_ar" text NOT NULL,
  "name_en" text,
  "slug" text NOT NULL,
  "description_ar" text,
  "description_en" text,
  "price_base" numeric(10, 2) NOT NULL CHECK (price_base >= 0),
  "price_discount" numeric(10, 2) CHECK (price_discount IS NULL OR price_discount < price_base),
  "stock_qty" int DEFAULT 0 CHECK (stock_qty >= 0),
  "rating_avg" numeric(3, 2) DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
  "review_count" int DEFAULT 0 CHECK (review_count >= 0),
  "is_active" boolean DEFAULT true,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "product_image" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL,
  "url" text NOT NULL,
  "alt_text" text,
  "is_primary" boolean DEFAULT false,
  "sort_order" int DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "product_variant" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL,
  "name_ar" text NOT NULL,
  "value_ar" text NOT NULL,
  "price_adjustment" numeric(10, 2) DEFAULT 0,
  "stock_qty" int DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 💰 TRADE MODULE - الطلبات والمبيعات
-- =====================================================

CREATE TABLE "trade_order" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number" text UNIQUE NOT NULL,
  "customer_id" uuid NOT NULL,
  "status" order_status DEFAULT 'pending',
  "items_total" numeric(10, 2) NOT NULL CHECK (items_total >= 0),
  "delivery_fee" numeric(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
  "discount_amount" numeric(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  "grand_total" numeric(10, 2) NOT NULL CHECK (grand_total >= 0),
  "payment_method" payment_method DEFAULT 'cod',
  "payment_status" payment_status DEFAULT 'pending',
  "currency" varchar(3) DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  "currency_rate" numeric(18, 6) DEFAULT 1 CHECK (currency_rate > 0),
  "shipping_address" jsonb NOT NULL,
  "delivery_latitude" numeric(10, 6),
  "delivery_longitude" numeric(10, 6),
  "is_confirmed" boolean DEFAULT false,
  "created_by" uuid,
  "updated_by" uuid,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- 📦 QR Code Delivery Verification Table
CREATE TABLE "trade_order_delivery" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid UNIQUE NOT NULL,
  "delivery_status" delivery_status DEFAULT 'pending',
  "verification_code" varchar(64) UNIQUE NOT NULL,  -- QR code unique identifier
  "delivered_at" timestamptz,
  "delivered_by" uuid,  -- staff member who delivered
  "customer_verified" boolean DEFAULT false,  -- customer confirmed receipt
  "delivery_notes" text,
  "failed_reason" text,  -- reason if delivery failed
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "trade_order_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "variant_id" uuid,
  "quantity" int NOT NULL CHECK (quantity > 0),
  "unit_price" numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  "subtotal" numeric(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- =====================================================
-- ⭐ SOCIAL MODULE - التقييمات والمفضلة
-- =====================================================

CREATE TABLE "social_review" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid,
  "author_id" uuid NOT NULL,
  "rating" int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  "comment" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "customer_favorite" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "created_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 🎧 SUPPORT MODULE - الدعم الفني
-- =====================================================

CREATE TABLE "support_ticket" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_number" varchar(50) UNIQUE NOT NULL,
  "reporter_id" uuid NOT NULL,
  "assigned_to" uuid,
  "order_id" uuid,
  "subject" text NOT NULL,
  "description" text NOT NULL,
  "status" ticket_status DEFAULT 'open',
  "priority" ticket_priority DEFAULT 'medium',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "ticket_message" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticket_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "content" text NOT NULL,
  "attachment_url" text,
  "is_internal" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- =====================================================
-- 🔔 SYSTEM MODULE - الإشعارات والسجلات
-- =====================================================

CREATE TABLE "sys_notification" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" uuid NOT NULL,
  "type" notify_type NOT NULL,
  "title_ar" text NOT NULL,
  "title_en" text,
  "content_ar" text NOT NULL,
  "content_en" text,
  "action_url" text,
  "data" jsonb DEFAULT '{}',
  "is_read" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE "system_error_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "error_message" text NOT NULL,
  "error_context" text,
  "error_details" jsonb DEFAULT '{}',
  "severity" error_severity DEFAULT 'error',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- =====================================================
--  INDEXES - الفهارس
-- =====================================================

-- Core Module
CREATE INDEX "idx_core_profile_deleted_at" ON "core_profile" ("deleted_at");
CREATE INDEX "idx_core_profile_created_at" ON "core_profile" ("created_at");
CREATE INDEX "idx_core_profile_email" ON "core_profile" ("email");
CREATE INDEX "idx_core_profile_phone" ON "core_profile" ("phone_number");

CREATE INDEX "idx_auth_password_reset_profile" ON "auth_password_reset" ("profile_id");
CREATE INDEX "idx_auth_password_reset_expires" ON "auth_password_reset" ("expires_at");
CREATE INDEX "idx_auth_password_reset_token" ON "auth_password_reset" ("token");

CREATE INDEX "idx_core_profile_role_profile" ON "core_profile_role" ("profile_id");
CREATE INDEX "idx_core_profile_role_role" ON "core_profile_role" ("role_id");

CREATE INDEX "idx_core_address_profile" ON "core_address" ("profile_id");
CREATE INDEX "idx_core_address_default" ON "core_address" ("is_default");

-- Store Settings
CREATE INDEX "idx_store_settings_currency" ON "store_settings" ("default_currency");

-- Store Module
CREATE INDEX "idx_store_category_parent" ON "store_category" ("parent_id");
CREATE UNIQUE INDEX "idx_store_category_slug" ON "store_category" ("slug");
CREATE INDEX "idx_store_category_active" ON "store_category" ("is_active");

CREATE INDEX "idx_store_product_category" ON "store_product" ("category_id");
CREATE INDEX "idx_store_product_user" ON "store_product" ("user_id");
CREATE UNIQUE INDEX "idx_store_product_slug" ON "store_product" ("slug");
CREATE INDEX "idx_store_product_active" ON "store_product" ("is_active");
CREATE INDEX "idx_store_product_deleted" ON "store_product" ("deleted_at");

CREATE INDEX "idx_product_image_product" ON "product_image" ("product_id");
CREATE INDEX "idx_product_image_updated" ON "product_image" ("updated_at");

CREATE INDEX "idx_product_variant_product" ON "product_variant" ("product_id");
CREATE INDEX "idx_product_variant_updated" ON "product_variant" ("updated_at");

-- Trade Module
CREATE INDEX "idx_trade_order_number" ON "trade_order" ("order_number");
CREATE INDEX "idx_trade_order_customer" ON "trade_order" ("customer_id");
CREATE INDEX "idx_trade_order_status" ON "trade_order" ("status");
CREATE INDEX "idx_trade_order_created" ON "trade_order" ("created_at");
CREATE INDEX "idx_trade_order_confirmed" ON "trade_order" ("is_confirmed");
CREATE INDEX "idx_trade_order_currency_created" ON "trade_order" ("currency", "created_at");

CREATE INDEX "idx_trade_order_delivery_order" ON "trade_order_delivery" ("order_id");
CREATE INDEX "idx_trade_order_delivery_code" ON "trade_order_delivery" ("verification_code");
CREATE INDEX "idx_trade_order_delivery_status" ON "trade_order_delivery" ("delivery_status");
CREATE INDEX "idx_trade_order_delivery_delivered" ON "trade_order_delivery" ("delivered_at");
CREATE INDEX "idx_trade_order_delivery_delivered_by" ON "trade_order_delivery" ("delivered_by");

CREATE INDEX "idx_trade_order_item_order" ON "trade_order_item" ("order_id");
CREATE INDEX "idx_trade_order_item_product" ON "trade_order_item" ("product_id");
CREATE INDEX "idx_trade_order_item_variant" ON "trade_order_item" ("variant_id");

-- Social Module
CREATE INDEX "idx_social_review_product" ON "social_review" ("product_id");
CREATE INDEX "idx_social_review_author" ON "social_review" ("author_id");
CREATE INDEX "idx_social_review_rating" ON "social_review" ("rating");
CREATE UNIQUE INDEX "idx_social_review_author_product" ON "social_review" ("author_id", "product_id") WHERE product_id IS NOT NULL;

CREATE INDEX "idx_customer_favorite_customer" ON "customer_favorite" ("customer_id");
CREATE INDEX "idx_customer_favorite_product" ON "customer_favorite" ("product_id");

-- Support Module
CREATE INDEX "idx_support_ticket_number" ON "support_ticket" ("ticket_number");
CREATE INDEX "idx_support_ticket_reporter" ON "support_ticket" ("reporter_id");
CREATE INDEX "idx_support_ticket_assigned" ON "support_ticket" ("assigned_to");
CREATE INDEX "idx_support_ticket_order" ON "support_ticket" ("order_id");
CREATE INDEX "idx_support_ticket_status" ON "support_ticket" ("status");

CREATE INDEX "idx_ticket_message_ticket" ON "ticket_message" ("ticket_id");
CREATE INDEX "idx_ticket_message_sender" ON "ticket_message" ("sender_id");
CREATE INDEX "idx_ticket_message_updated" ON "ticket_message" ("updated_at");

-- System Module
CREATE INDEX "idx_sys_notification_recipient" ON "sys_notification" ("recipient_id");
CREATE INDEX "idx_sys_notification_type" ON "sys_notification" ("type");
CREATE INDEX "idx_sys_notification_read" ON "sys_notification" ("is_read");
CREATE INDEX "idx_sys_notification_created" ON "sys_notification" ("created_at");

CREATE INDEX "idx_system_error_log_created" ON "system_error_log" ("created_at");
CREATE INDEX "idx_system_error_log_severity" ON "system_error_log" ("severity");

-- Exchange Rates Module
CREATE INDEX "idx_exchange_rates_currency" ON "exchange_rates" ("currency_code");
CREATE INDEX "idx_exchange_rates_updated" ON "exchange_rates" ("last_updated_at");
CREATE INDEX "idx_exchange_rates_currency_updated" ON "exchange_rates" ("currency_code", "last_updated_at");

-- =====================================================
-- 🔗 FOREIGN KEYS - المفاتيح الخارجية
-- =====================================================

-- ⚠️ ملاحظة: العلاقة بين auth.users و core_profile موجودة في Supabase فقط
-- يتم إنشاؤها عند ربط Supabase Auth مع قاعدة البيانات
-- ALTER TABLE "core_profile" ADD FOREIGN KEY ("id")
--   REFERENCES auth.users ("id") ON DELETE CASCADE;

-- Core Module
ALTER TABLE "core_profile_role" ADD FOREIGN KEY ("profile_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;
ALTER TABLE "core_profile_role" ADD FOREIGN KEY ("role_id")
  REFERENCES "core_role" ("id") ON DELETE CASCADE;

ALTER TABLE "core_address" ADD FOREIGN KEY ("profile_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;

ALTER TABLE "auth_password_reset" ADD FOREIGN KEY ("profile_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;

-- Store Settings
ALTER TABLE "store_settings" ADD FOREIGN KEY ("default_currency")
  REFERENCES "exchange_rates" ("currency_code") ON DELETE RESTRICT;

-- Store Module
ALTER TABLE "store_category" ADD FOREIGN KEY ("parent_id")
  REFERENCES "store_category" ("id") ON DELETE SET NULL;

ALTER TABLE "store_product" ADD FOREIGN KEY ("category_id")
  REFERENCES "store_category" ("id") ON DELETE SET NULL;
ALTER TABLE "store_product" ADD FOREIGN KEY ("user_id")
  REFERENCES "core_profile" ("id") ON DELETE SET NULL;

ALTER TABLE "product_image" ADD FOREIGN KEY ("product_id")
  REFERENCES "store_product" ("id") ON DELETE CASCADE;

ALTER TABLE "product_variant" ADD FOREIGN KEY ("product_id")
  REFERENCES "store_product" ("id") ON DELETE CASCADE;

-- Trade Module
ALTER TABLE "trade_order" ADD FOREIGN KEY ("customer_id")
  REFERENCES "core_profile" ("id") ON DELETE RESTRICT;
ALTER TABLE "trade_order" ADD FOREIGN KEY ("created_by")
  REFERENCES "core_profile" ("id") ON DELETE SET NULL;
ALTER TABLE "trade_order" ADD FOREIGN KEY ("updated_by")
  REFERENCES "core_profile" ("id") ON DELETE SET NULL;
ALTER TABLE "trade_order" ADD FOREIGN KEY ("currency")
  REFERENCES "exchange_rates" ("currency_code") ON DELETE RESTRICT;

ALTER TABLE "trade_order_delivery" ADD FOREIGN KEY ("order_id")
  REFERENCES "trade_order" ("id") ON DELETE CASCADE;
ALTER TABLE "trade_order_delivery" ADD FOREIGN KEY ("delivered_by")
  REFERENCES "core_profile" ("id") ON DELETE SET NULL;

ALTER TABLE "trade_order_item" ADD FOREIGN KEY ("order_id")
  REFERENCES "trade_order" ("id") ON DELETE CASCADE;
ALTER TABLE "trade_order_item" ADD FOREIGN KEY ("product_id")
  REFERENCES "store_product" ("id") ON DELETE RESTRICT;
ALTER TABLE "trade_order_item" ADD FOREIGN KEY ("variant_id")
  REFERENCES "product_variant" ("id") ON DELETE SET NULL;

-- Social Module
ALTER TABLE "social_review" ADD FOREIGN KEY ("product_id")
  REFERENCES "store_product" ("id") ON DELETE SET NULL;
ALTER TABLE "social_review" ADD FOREIGN KEY ("author_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;

ALTER TABLE "customer_favorite" ADD FOREIGN KEY ("customer_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;
ALTER TABLE "customer_favorite" ADD FOREIGN KEY ("product_id")
  REFERENCES "store_product" ("id") ON DELETE CASCADE;

-- Support Module
ALTER TABLE "support_ticket" ADD FOREIGN KEY ("reporter_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;
ALTER TABLE "support_ticket" ADD FOREIGN KEY ("assigned_to")
  REFERENCES "core_profile" ("id") ON DELETE SET NULL;
ALTER TABLE "support_ticket" ADD FOREIGN KEY ("order_id")
  REFERENCES "trade_order" ("id") ON DELETE SET NULL;

ALTER TABLE "ticket_message" ADD FOREIGN KEY ("ticket_id")
  REFERENCES "support_ticket" ("id") ON DELETE CASCADE;
ALTER TABLE "ticket_message" ADD FOREIGN KEY ("sender_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;

-- System Module
ALTER TABLE "sys_notification" ADD FOREIGN KEY ("recipient_id")
  REFERENCES "core_profile" ("id") ON DELETE CASCADE;

-- =====================================================
-- 📝 COMMENTS - التعليقات التوضيحية
-- =====================================================

COMMENT ON TABLE "exchange_rates" IS 'أسعار صرف العملات - تُحدَّث تلقائياً كل ساعة';
COMMENT ON COLUMN "exchange_rates"."currency_code" IS 'رمز العملة (ISO 4217) مثل: USD, SAR, EGP';
COMMENT ON COLUMN "exchange_rates"."rate_from_usd" IS 'سعر الصرف: 1 USD = X من العملة المحلية';

COMMENT ON TABLE "core_profile" IS 'الملفات الشخصية للمستخدمين (جميع الأدوار)';
COMMENT ON TABLE "store_settings" IS 'إعدادات المتجر الوحيد - معلومات المتجر الرئيسي';
COMMENT ON TABLE "store_product" IS 'المنتجات الغذائية المعروضة للبيع (تاجر واحد)';
COMMENT ON COLUMN "store_product"."user_id" IS 'مالك المنتج (للتحويل المستقبلي لمتجر متعدد الباعة)';
COMMENT ON TABLE "trade_order" IS 'طلبات الشراء من العملاء';
COMMENT ON TABLE "trade_order_delivery" IS 'تتبع تسليم الطلبات والتحقق عبر QR Code';

-- =====================================================
-- ✅ END OF SCHEMA
-- =====================================================
