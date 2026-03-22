-- Data Insertion File

-- =====================================================
-- Marketna E-Commerce - Roles Data
-- File: 03_roles_data.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Default data for roles table
-- Dependencies: public.roles
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Insert default roles (4 roles)
-- =====================================================


-- =====================================================
-- 1️⃣ Insert Default Roles
-- =====================================================
-- Four roles: admin, vendor, delivery, customer

INSERT INTO public.roles (name, description, permissions)
VALUES
  ('admin'::role_name, 'Full access to all system parts',
   '["*:*", "users:manage", "system:config", "reports:all", "analytics:full", "roles:manage"]'::jsonb),

  ('vendor'::role_name, 'Manage products and orders for the store',
   '["products:create", "products:update", "products:delete", "products:read", "orders:read_own", "orders:update_status", "profile:update", "inventory:manage", "analytics:own"]'::jsonb),

  ('delivery'::role_name, 'Manage delivery tasks and update order statuses',
   '["deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:read", "orders:read_assigned", "orders:update_delivery", "profile:update", "earnings:view"]'::jsonb),

  ('customer'::role_name, 'Browse products and create orders',
   '["products:read", "orders:create", "orders:read_own", "profile:update", "reviews:create", "wishlist:manage"]'::jsonb)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();


-- =====================================================
-- ✅ End of File
-- =====================================================
