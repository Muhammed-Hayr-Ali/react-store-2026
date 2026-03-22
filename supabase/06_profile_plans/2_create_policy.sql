-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Profile Plans Links Policies
-- File: 06_profile_plans_links_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول ربط البروفايل بالخطط
-- Dependencies: public.profile_plans
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS
-- 2. سياسة القراءة للمستخدمين
-- 3. سياسة الإدارة للمستخدمين
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS
-- =====================================================

ALTER TABLE public.profile_plans ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسة القراءة للمستخدمين
-- =====================================================
-- المستخدم يقرأ خطته فقط

DROP POLICY IF EXISTS "profile_plans_read_own" ON public.profile_plans;
CREATE POLICY "profile_plans_read_own"
  ON public.profile_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON POLICY "profile_plans_read_own" ON public.profile_plans IS 'المستخدم يقرأ خطته فقط';


-- =====================================================
-- 3️⃣ سياسة الإدارة للمستخدمين
-- =====================================================
-- المستخدم يدير خطته فقط

DROP POLICY IF EXISTS "profile_plans_manage_own" ON public.profile_plans;
CREATE POLICY "profile_plans_manage_own"
  ON public.profile_plans FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON POLICY "profile_plans_manage_own" ON public.profile_plans IS 'المستخدم يدير خطته فقط';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
