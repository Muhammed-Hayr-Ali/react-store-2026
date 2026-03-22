-- =====================================================
-- Marketna E-Commerce - Profile Plans Link Table
-- File: 06_profile_plans_links.sql
-- Version: 2.0
-- Date: 2026-03-22
-- Description: جدول ربط البروفايل بالخطط - مصحح ومتوافق
-- Dependencies: public.profiles, public.plans
-- Links: user_id → profiles.id, plan_id → plans.id
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تنظيف كامل قبل الإنشاء
-- 2. إنشاء جدول ربط البروفايل بالخطط
-- 3. الفهارس (Indexes)
-- 4. الأمان (RLS)
-- =====================================================


-- =====================================================
-- 1️⃣ إنشاء جدول ربط البروفايل بالخطط
-- =====================================================

CREATE TABLE public.profile_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  plan_id           UUID NOT NULL,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending', 'trial')),
  start_date        TIMESTAMPTZ DEFAULT NOW(),
  end_date          TIMESTAMPTZ,
  trial_end_date    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign Keys (مصحة ومتوافقة مع جدول profiles)
  CONSTRAINT profile_plans_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_plans_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT,
  CONSTRAINT profile_plans_dates_check 
    CHECK (end_date IS NULL OR end_date > start_date)
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
-- 3️⃣ الفهارس (Indexes)
-- =====================================================

-- فهرس فريد للاشتراكات النشطة (لمنع تكرار الاشتراك النشط)
CREATE UNIQUE INDEX idx_profile_plans_active_unique
  ON public.profile_plans(user_id, plan_id)
  WHERE status IN ('active', 'trial');

-- فهارس البحث الأساسية
CREATE INDEX idx_profile_plans_user ON public.profile_plans(user_id);
CREATE INDEX idx_profile_plans_plan ON public.profile_plans(plan_id);
CREATE INDEX idx_profile_plans_status ON public.profile_plans(status);
CREATE INDEX idx_profile_plans_created_at ON public.profile_plans(created_at DESC);

COMMENT ON INDEX idx_profile_plans_active_unique IS 'ضمان خطة نشطة واحدة لكل مستخدم';
COMMENT ON INDEX idx_profile_plans_user IS 'بحث سريع بمعرف المستخدم';
COMMENT ON INDEX idx_profile_plans_plan IS 'بحث سريع بمعرف الخطة';
COMMENT ON INDEX idx_profile_plans_status IS 'تصفية الخطط حسب الحالة';
COMMENT ON INDEX idx_profile_plans_created_at IS 'الترتيب حسب تاريخ الإنشاء';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

-- عرض ملخص الجدول
SELECT 
  'profile_plans' AS table_name,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE status = 'active') AS active_plans,
  COUNT(*) FILTER (WHERE status = 'trial') AS trial_plans,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_plans,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.profile_plans;

-- عرض معلومات الفهارس
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename = 'profile_plans'
ORDER BY indexname;

-- عرض سياسات الأمان
SELECT
  policyname,
  cmd,
  roles,
  qual AS using_condition,
  with_check
FROM pg_policies
WHERE tablename = 'profile_plans'
ORDER BY policyname;
