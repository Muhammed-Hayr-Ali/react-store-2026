-- ملف إنشاء البيانات

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Data
-- File: 05_subscriptions_data.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: البيانات الافتراضية لخطط الاشتراك
-- Dependencies: public.plans
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. خطط البائعين (4 خطط)
-- 2. خطط شركاء التوصيل (3 خطط)
-- 3. خطط العملاء (1 خطة)
-- =====================================================


-- =====================================================
-- 1️⃣ خطط البائعين (Seller Plans)
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('seller', 'البائع المجاني', 0, 'lifetime',
 '{"products:create": true, "products:update": true, "products:delete": false, "orders:view": true}'::jsonb,
 true, false),

('seller', 'البائع المبتدئ', 29.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true}'::jsonb,
 false, false),

('seller', 'البائع المحترف', 59.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "analytics:view": true}'::jsonb,
 false, true),

('seller', 'البائع المؤسسي', 99.99, 'yearly',
 '{"products:create": true, "products:update": true, "products:delete": true, "orders:view": true, "orders:export": true, "api:access": true}'::jsonb,
 false, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- 2️⃣ خطط شركاء التوصيل (Delivery Plans)
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('delivery', 'شريك التوصيل المجاني', 0, 'lifetime',
 '{"deliveries:accept": true, "deliveries:track": true, "earnings:view": true}'::jsonb,
 true, false),

('delivery', 'شريك التوصيل المبتدئ', 29.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true}'::jsonb,
 false, false),

('delivery', 'شريك التوصيل المحترف', 49.99, 'yearly',
 '{"deliveries:accept": true, "deliveries:track": true, "deliveries:schedule": true, "earnings:view": true, "earnings:export": true}'::jsonb,
 false, true)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- 3️⃣ خطط العملاء (Customer Plans)
-- =====================================================

INSERT INTO public.plans (category, name, price, billing_period, permissions, is_default, is_popular) VALUES
('customer', 'عضو مجاني', 0, 'lifetime',
 '{"orders:create": true, "reviews:write": true, "wishlist:manage": true, "tracking:view": true}'::jsonb,
 true, false)
ON CONFLICT (category, name) DO UPDATE
SET price = EXCLUDED.price,
    permissions = EXCLUDED.permissions,
    is_popular = EXCLUDED.is_popular;


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
