-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Definitions
-- File: 05_subscriptions.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: جدول تعريف خطط الاشتراك - مع ENUM للفئة
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تنظيف كامل قبل الإنشاء
-- 2. إنشاء ENUM لفئات الخطط
-- 3. إنشاء جدول تعريف الخطط
-- 4. الفهارس (Indexes)
-- =====================================================


-- =====================================================
-- 1️⃣إنشاء ENUM لفئات الخطط
-- =====================================================

CREATE TYPE plan_category AS ENUM ('seller', 'delivery', 'customer');

COMMENT ON TYPE plan_category IS 'فئات خطط الاشتراك المتاحة في النظام';


-- =====================================================
-- 2️⃣ إنشاء جدول تعريف الخطط
-- =====================================================

CREATE TABLE public.plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     plan_category NOT NULL,
  name         TEXT NOT NULL,
  price        NUMERIC NOT NULL DEFAULT 0,
  billing_period TEXT DEFAULT 'yearly',
  permissions  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default   BOOLEAN DEFAULT false,
  is_popular   BOOLEAN DEFAULT false,

  CONSTRAINT unique_category_name UNIQUE (category, name)
);

-- Comments
COMMENT ON TABLE public.plans IS 'جدول تعريف خطط الاشتراك - قوالب الصلاحيات لكل فئة';
COMMENT ON COLUMN public.plans.id IS 'معرف فريد للخطة';
COMMENT ON COLUMN public.plans.category IS 'فئة الخطة: seller, delivery, customer';
COMMENT ON COLUMN public.plans.name IS 'اسم الخطة';
COMMENT ON COLUMN public.plans.price IS 'سعر الخطة';
COMMENT ON COLUMN public.plans.billing_period IS 'فترة الفوترة';
COMMENT ON COLUMN public.plans.permissions IS 'صلاحيات الخطة بصيغة JSONB';
COMMENT ON COLUMN public.plans.is_default IS 'هل هذه الخطة افتراضية';
COMMENT ON COLUMN public.plans.is_popular IS 'هل هذه الخطة شائعة';


-- =====================================================
-- 3️⃣ الفهارس (Indexes)
-- =====================================================

CREATE INDEX idx_plans_category ON public.plans(category);
CREATE INDEX idx_plans_permissions ON public.plans USING GIN(permissions);

COMMENT ON INDEX idx_plans_category IS 'بحث سريع بفئة الخطة';
COMMENT ON INDEX idx_plans_permissions IS 'بحث داخل مصفوفة الصلاحيات JSONB';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

