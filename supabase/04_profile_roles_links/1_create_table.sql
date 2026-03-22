-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Profile Roles Link Table
-- File: 04_profile_roles_links.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: جدول ربط البروفايل مع الأدوار
-- Dependencies: public.profiles, public.roles
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تنظيف كامل قبل الإنشاء
-- 2. إنشاء جدول ربط البروفايل مع الأدوار
-- 3. الفهارس (Indexes)
-- =====================================================

-- =====================================================
-- 1️⃣ إنشاء جدول ربط البروفايل مع الأدوار
-- =====================================================

CREATE TABLE public.profile_roles (
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id      UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT true,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  granted_by   UUID REFERENCES auth.users(id),

  PRIMARY KEY (user_id, role_id)
);

-- Comments
COMMENT ON TABLE public.profile_roles IS 'جدول ربط البروفايل مع الأدوار';
COMMENT ON COLUMN public.profile_roles.user_id IS 'معرف المستخدم (من profiles.id)';
COMMENT ON COLUMN public.profile_roles.role_id IS 'معرف الدور (من roles.id)';
COMMENT ON COLUMN public.profile_roles.is_active IS 'هل الدور نشط حالياً';
COMMENT ON COLUMN public.profile_roles.granted_at IS 'تاريخ منح الدور';
COMMENT ON COLUMN public.profile_roles.granted_by IS 'من قام بمنح الدور';


-- =====================================================
-- 2️⃣ الفهارس (Indexes)
-- =====================================================

CREATE INDEX idx_profile_roles_user ON public.profile_roles(user_id);
CREATE INDEX idx_profile_roles_role ON public.profile_roles(role_id);
CREATE INDEX idx_profile_roles_active ON public.profile_roles(is_active);

COMMENT ON INDEX idx_profile_roles_user IS 'بحث سريع بمعرف المستخدم';
COMMENT ON INDEX idx_profile_roles_role IS 'بحث سريع بمعرف الدور';
COMMENT ON INDEX idx_profile_roles_active IS 'تصفية الأدوار النشطة';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
