-- ملف إنشاء البيانات

-- =====================================================
-- Marketna E-Commerce - Roles Data
-- File: 03_roles_data.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: البيانات الافتراضية لجدول الأدوار
-- Dependencies: public.roles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. إدخال الأدوار الافتراضية (4 أدوار)
-- =====================================================


-- =====================================================
-- 1️⃣ إدخال الأدوار الافتراضية
-- =====================================================
-- الأدوار الأربعة: admin, vendor, delivery, customer

INSERT INTO public.roles (name, description, permissions)
VALUES
  ('admin'::role_name, 'صلاحيات كاملة للوصول إلى جميع أجزاء النظام',
   '["*:*", "users:manage", "system:config", "reports:all", "analytics:full", "roles:manage"]'::jsonb),

  ('vendor'::role_name, 'إدارة المنتجات والطلبات الخاصة بالمتجر',
   '["products:create", "products:update", "products:delete", "products:read", "orders:read_own", "orders:update_status", "profile:update", "inventory:manage", "analytics:own"]'::jsonb),

  ('delivery'::role_name, 'إدارة مهام التوصيل وتحديث حالات الطلبات',
   '["deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:read", "orders:read_assigned", "orders:update_delivery", "profile:update", "earnings:view"]'::jsonb),

  ('customer'::role_name, 'تصفح المنتجات وإنشاء الطلبات',
   '["products:read", "orders:create", "orders:read_own", "profile:update", "reviews:create", "wishlist:manage"]'::jsonb)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
