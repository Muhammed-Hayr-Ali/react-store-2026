-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Subscription Plans Policies
-- File: 05_subscriptions_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول خطط الاشتراك
-- Dependencies: public.plans
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS
-- 2. سياسة القراءة العامة
-- 3. سياسة الإدارة للمدراء
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS
-- =====================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسة القراءة العامة
-- =====================================================
-- قراءة عامة لجميع خطط الاشتراك

DROP POLICY IF EXISTS "plans_public_read" ON public.plans;
CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT
  TO authenticated, anon
  USING (true);

COMMENT ON POLICY "plans_public_read" ON public.plans IS 'قراءة عامة لجميع الخطط';


-- =====================================================
-- 3️⃣ سياسة الإدارة للمدراء
-- =====================================================
-- المدراء يديرون جميع الخطط

DROP POLICY IF EXISTS "plans_admin_write" ON public.plans;
CREATE POLICY "plans_admin_write"
  ON public.plans FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "plans_admin_write" ON public.plans IS 'المدراء يديرون جميع الخطط';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
