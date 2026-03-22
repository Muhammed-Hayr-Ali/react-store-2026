-- ملف إنشاء السياسات

-- =====================================================
-- Marketna E-Commerce - Profile Roles Links Policies
-- File: 04_profile_roles_links_policies.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: سياسات الأمان لجدول ربط البروفايل مع الأدوار
-- Dependencies: public.profile_roles, public.roles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تفعيل RLS
-- 2. سياسة القراءة للمستخدمين
-- 3. سياسة القراءة للمدراء
-- 4. سياسة الإدارة للمدراء
-- =====================================================


-- =====================================================
-- 1️⃣ تفعيل RLS
-- =====================================================

ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 2️⃣ سياسة القراءة للمستخدمين
-- =====================================================
-- المستخدم يقرأ أدواره النشطة فقط

DROP POLICY IF EXISTS "profile_roles_read_own" ON public.profile_roles;
CREATE POLICY "profile_roles_read_own"
  ON public.profile_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND is_active = true
  );

COMMENT ON POLICY "profile_roles_read_own" ON public.profile_roles IS 'المستخدم يقرأ أدواره النشطة فقط';


-- =====================================================
-- 3️⃣ سياسة القراءة للمدراء
-- =====================================================
-- المدراء يقرأون جميع الأدوار

DROP POLICY IF EXISTS "profile_roles_admin_read_all" ON public.profile_roles;
CREATE POLICY "profile_roles_admin_read_all"
  ON public.profile_roles FOR SELECT
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
  );

COMMENT ON POLICY "profile_roles_admin_read_all" ON public.profile_roles IS 'المدراء يقرأون جميع الأدوار';


-- =====================================================
-- 4️⃣ سياسة الإدارة للمدراء
-- =====================================================
-- فقط المدراء يمكنهم إدارة الأدوار

DROP POLICY IF EXISTS "profile_roles_admin_manage" ON public.profile_roles;
CREATE POLICY "profile_roles_admin_manage"
  ON public.profile_roles FOR ALL
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

COMMENT ON POLICY "profile_roles_admin_manage" ON public.profile_roles IS 'فقط المدراء يمكنهم إدارة الأدوار';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
