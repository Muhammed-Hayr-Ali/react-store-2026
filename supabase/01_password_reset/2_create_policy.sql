-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Policies
-- File: 01_password_reset_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول رموز إعادة التعيين
-- Dependencies: public.password_reset_tokens
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS
-- 2. سياسة منع القراءة العامة
-- 3. سياسة الوصول الكامل للخدمة الخلفية
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS
-- =====================================================

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسة منع القراءة العامة تماماً
-- =====================================================
-- يمنع أي قراءة من أي مستخدم (حتى المصادقين)

DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_no_public_read"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated, anon
  USING (false);

COMMENT ON POLICY "password_reset_tokens_no_public_read" ON public.password_reset_tokens IS 'منع أي قراءة عامة - الرموز سرية تماماً';


-- =====================================================
-- 3️⃣ سياسة الوصول الكامل للخدمة الخلفية
-- =====================================================
-- يسمح فقط للخدمة الخلفية (Service Role) بالوصول الكامل

DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;
CREATE POLICY "password_reset_tokens_service_full_access"
  ON public.password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "password_reset_tokens_service_full_access" ON public.password_reset_tokens IS 'الخدمة الخلفية فقط لها وصول كامل';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

