-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Roles Policies
-- File: 03_roles_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول الأدوار
-- Dependencies: public.roles, public.profile_roles
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

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسة القراءة العامة
-- =====================================================
-- قراءة عامة لجميع الأدوار (للعرض فقط)

DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
CREATE POLICY "roles_public_read"
  ON public.roles FOR SELECT
  TO authenticated, anon
  USING (true);

COMMENT ON POLICY "roles_public_read" ON public.roles IS 'قراءة عامة لجميع الأدوار';


-- =====================================================
-- 3️⃣ سياسة الإدارة للمدراء
-- =====================================================
-- فقط المدراء يمكنهم إدارة الأدوار

DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;
CREATE POLICY "roles_admin_manage"
  ON public.roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profile_roles pr
      JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.user_id = auth.uid()
        AND r.name = 'admin'
        AND pr.is_active = true
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "roles_admin_manage" ON public.roles IS 'فقط المدراء يمكنهم إدارة الأدوار';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
