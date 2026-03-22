-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Profiles Schema
-- File: 02_profiles.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: جدول البروفايل - البيانات الأساسية فقط
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. الامتدادات (Extensions)
-- 2. إنشاء جدول البروفايل
-- 3. الفهارس (Indexes)
-- =====================================================


-- =====================================================
-- 1️⃣ الامتدادات (Extensions)
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- 2️⃣ إنشاء جدول البروفايل
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- === الهوية والربط ===
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- === مزود المصادقة ===
  provider TEXT DEFAULT 'email',

  -- === المعلومات الأساسية ===
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), '')
  ) STORED,

  -- === بيانات التواصل ===
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,

  -- === الحالة والتواريخ ===
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.profiles IS 'جدول البروفايل - البيانات الأساسية للمستخدمين';
COMMENT ON COLUMN public.profiles.id IS 'المعرف الفريد (من auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'البريد الإلكتروني للمستخدم';
COMMENT ON COLUMN public.profiles.provider IS 'مزود المصادقة: email, google, github, etc.';
COMMENT ON COLUMN public.profiles.first_name IS 'الاسم الأول';
COMMENT ON COLUMN public.profiles.last_name IS 'اسم العائلة';
COMMENT ON COLUMN public.profiles.full_name IS 'الاسم الكامل (محسوب تلقائياً)';
COMMENT ON COLUMN public.profiles.phone IS 'رقم الهاتف';
COMMENT ON COLUMN public.profiles.phone_verified IS 'هل تم التحقق من رقم الهاتف';
COMMENT ON COLUMN public.profiles.avatar_url IS 'رابط الصورة الشخصية';
COMMENT ON COLUMN public.profiles.bio IS 'نبذة تعريفية';
COMMENT ON COLUMN public.profiles.email_verified IS 'هل تم التحقق من البريد الإلكتروني';
COMMENT ON COLUMN public.profiles.created_at IS 'تاريخ إنشاء البروفايل';
COMMENT ON COLUMN public.profiles.updated_at IS 'تاريخ آخر تحديث للبروفايل';
COMMENT ON COLUMN public.profiles.last_sign_in_at IS 'تاريخ آخر تسجيل دخول';


-- =====================================================
-- 3️⃣ الفهارس (Indexes)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON public.profiles(last_sign_in_at DESC);

COMMENT ON INDEX idx_profiles_email IS 'البحث بالبريد الإلكتروني';
COMMENT ON INDEX idx_profiles_provider IS 'البحث حسب مزود المصادقة';
COMMENT ON INDEX idx_profiles_created_at IS 'الترتيب حسب تاريخ الإنشاء';
COMMENT ON INDEX idx_profiles_last_sign_in IS 'الترتيب حسب آخر تسجيل دخول';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
