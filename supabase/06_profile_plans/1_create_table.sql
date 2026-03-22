-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Profile Plans Link Table
-- File: 06_profile_plans_links.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: جدول ربط البروفايل بالخطط
-- Dependencies: public.profiles, public.plans
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تنظيف كامل قبل الإنشاء
-- 2. إنشاء جدول ربط البروفايل بالخطط
-- 3. الفهارس (Indexes)
-- =====================================================

-- =====================================================
-- 1️⃣ إنشاء جدول ربط البروفايل بالخطط
-- =====================================================

CREATE TABLE public.profile_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id           UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),
  start_date        TIMESTAMPTZ DEFAULT NOW(),
  end_date          TIMESTAMPTZ,
  trial_end_date    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_plan_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- Comments
COMMENT ON TABLE public.profile_plans IS 'جدول ربط البروفايل بالخطط';
COMMENT ON COLUMN public.profile_plans.id IS 'معرف فريد للسجل';
COMMENT ON COLUMN public.profile_plans.user_id IS 'معرف المستخدم (من profiles.id)';
COMMENT ON COLUMN public.profile_plans.plan_id IS 'معرف الخطة (من plans.id)';
COMMENT ON COLUMN public.profile_plans.status IS 'حالة الخطة: active, expired, cancelled, pending, trial';
COMMENT ON COLUMN public.profile_plans.start_date IS 'تاريخ بدء الخطة';
COMMENT ON COLUMN public.profile_plans.end_date IS 'تاريخ انتهاء الخطة';
COMMENT ON COLUMN public.profile_plans.trial_end_date IS 'تاريخ انتهاء الفترة التجريبية';
COMMENT ON COLUMN public.profile_plans.created_at IS 'تاريخ إنشاء السجل';
COMMENT ON COLUMN public.profile_plans.updated_at IS 'تاريخ آخر تحديث للسجل';


-- =====================================================
-- 2️⃣ الفهارس (Indexes)
-- =====================================================

CREATE UNIQUE INDEX idx_profile_plans_active_unique
  ON public.profile_plans(user_id, plan_id)
  WHERE status IN ('active', 'trial');

CREATE INDEX idx_profile_plans_user ON public.profile_plans(user_id);
CREATE INDEX idx_profile_plans_plan ON public.profile_plans(plan_id);
CREATE INDEX idx_profile_plans_status ON public.profile_plans(status);

COMMENT ON INDEX idx_profile_plans_active_unique IS 'ضمان خطة نشطة واحدة لكل مستخدم وخطة';
COMMENT ON INDEX idx_profile_plans_user IS 'بحث سريع بمعرف المستخدم';
COMMENT ON INDEX idx_profile_plans_plan IS 'بحث سريع بمعرف خطة الاشتراك';
COMMENT ON INDEX idx_profile_plans_status IS 'تصفية الخطط حسب الحالة';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
