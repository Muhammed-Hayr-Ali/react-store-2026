-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Roles Definitions
-- File: 03_roles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: جدول تعريف الأدوار - مع ENUM للنوع
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. تنظيف كامل قبل الإنشاء
-- 2. إنشاء ENUM للأدوار
-- 3. إنشاء جدول تعريف الأدوار
-- 4. الفهارس (Indexes)
-- =====================================================


-- =====================================================
-- 1️⃣ إنشاء ENUM للأدوار
-- =====================================================

CREATE TYPE public.role_name AS ENUM (
  'admin',
  'vendor',
  'delivery',
  'customer'
);

COMMENT ON TYPE public.role_name IS 'أنواع الأدوار المتاحة في النظام';


-- =====================================================
-- 2️⃣ إنشاء جدول تعريف الأدوار
-- =====================================================

CREATE TABLE public.roles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         role_name NOT NULL UNIQUE,
  description  TEXT,
  permissions  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.roles IS 'جدول تعريف الأدوار - قوالب صلاحيات فقط';
COMMENT ON COLUMN public.roles.id IS 'معرف فريد للدور';
COMMENT ON COLUMN public.roles.name IS 'اسم الدور: admin, vendor, delivery, customer';
COMMENT ON COLUMN public.roles.description IS 'وصف الدور';
COMMENT ON COLUMN public.roles.permissions IS 'مصفوفة الصلاحيات الافتراضية للدور';
COMMENT ON COLUMN public.roles.created_at IS 'تاريخ إنشاء الدور';
COMMENT ON COLUMN public.roles.updated_at IS 'تاريخ آخر تحديث للدور';


-- =====================================================
-- 3️⃣ الفهارس (Indexes)
-- =====================================================

CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_permissions ON public.roles USING GIN(permissions);
CREATE INDEX idx_roles_created_at ON public.roles(created_at DESC);

COMMENT ON INDEX idx_roles_name IS 'بحث سريع باسم الدور';
COMMENT ON INDEX idx_roles_permissions IS 'بحث داخل مصفوفة الصلاحيات JSONB';
COMMENT ON INDEX idx_roles_created_at IS 'ترتيب الأدوار حسب تاريخ الإنشاء';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

