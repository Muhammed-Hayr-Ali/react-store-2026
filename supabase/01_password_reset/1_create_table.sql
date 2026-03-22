-- ملف إنشاء الجداول

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Schema
-- File: 01_password_reset_tokens.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: نظام آمن لإعادة تعيين كلمة المرور
-- Dependencies: None (Standalone)
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. إنشاء جدول رموز إعادة التعيين
-- 2. الفهارس (Indexes)
-- 3. التعليقات التوضيحية
-- =====================================================


-- =====================================================
-- 1️⃣ إنشاء جدول رموز إعادة التعيين
-- =====================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.password_reset_tokens IS 'رموز إعادة تعيين كلمة المرور - صالحة لمدة 60 دقيقة';
COMMENT ON COLUMN public.password_reset_tokens.id IS 'المعرف الفريد للرمز';
COMMENT ON COLUMN public.password_reset_tokens.user_id IS 'معرف المستخدم المستهدف (من auth.users)';
COMMENT ON COLUMN public.password_reset_tokens.email IS 'البريد الإلكتروني للمستخدم';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'الرمز السري (64 حرف أبجدي رقمي)';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'وقت انتهاء الصلاحية';
COMMENT ON COLUMN public.password_reset_tokens.used_at IS 'وقت الاستخدام (NULL إذا لم يُستخدم)';
COMMENT ON COLUMN public.password_reset_tokens.ip_address IS 'عنوان IP لمقدم الطلب (للتدقيق الأمني)';
COMMENT ON COLUMN public.password_reset_tokens.created_at IS 'تاريخ إنشاء الرمز';


-- =====================================================
-- 2️⃣ الفهارس (Indexes)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_created_at ON public.password_reset_tokens(created_at DESC);

COMMENT ON INDEX idx_password_reset_tokens_token IS 'البحث السريع عن الرمز (الاستخدام الأساسي)';
COMMENT ON INDEX idx_password_reset_tokens_user_id IS 'استعلام رموز مستخدم معين';
COMMENT ON INDEX idx_password_reset_tokens_email IS 'البحث بالبريد الإلكتروني';
COMMENT ON INDEX idx_password_reset_tokens_expires_at IS 'تنظيف الرموز المنتهية';
COMMENT ON INDEX idx_password_reset_tokens_created_at IS 'الترتيب الزمني';


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================

