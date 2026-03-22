-- Data Insertion File

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Data
-- File: 05_subscriptions_data.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: Default data for subscription plans
-- Dependencies: public.plans
-- =====================================================

-- =====================================================
-- 📋 File Contents
-- =====================================================
-- 1. Seller plans (4 plans)
-- 2. Delivery partner plans (3 plans)
-- 3. Customer plans (1 plan)
-- =====================================================


-- =====================================================
-- 1️⃣ Seller Plans
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('seller', 'Free Seller', 0, 'lifetime',
 '{"products:create": true, "products:update": true, "products:delete": false, "orders:view": true}'::jsonb,
 true, false),

('seller', 'Starter Seller', 29.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true}'::jsonb,
 false, false),

('seller', 'Professional Seller', 59.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "analytics:view": true}'::jsonb,
 false, true),

('seller', 'Enterprise Seller', 99.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "api:access": true}'::jsonb,
 false, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- 2️⃣ Delivery Partner Plans
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('delivery', 'Free Delivery Partner', 0, 'lifetime',
 '{"deliveries:accept": true, "deliveries:track": true, "earnings:view": true}'::jsonb,
 true, false),

('delivery', 'Starter Delivery Partner', 29.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true}'::jsonb,
 false, false),

('delivery', 'Professional Delivery Partner', 49.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true, "earnings:export": true}'::jsonb,
 false, true)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- 3️⃣ Customer Plans
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('customer', 'Free Member', 0, 'lifetime',
 '{"orders:create": true, "reviews:write": true, "wishlist:manage": true, "tracking:view": true}'::jsonb,
 true, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- ✅ End of File
-- =====================================================
