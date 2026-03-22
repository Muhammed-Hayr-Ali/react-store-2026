-- ملف حذف الجدول

-- =====================================================
-- Marketna E-Commerce - Password Reset Tokens Drop
-- File: drop_password_reset_tokens.sql
-- Version: 1.0
-- Date: 2026-03-21
-- Description: حذف جدول رموز إعادة تعيين كلمة المرور
-- =====================================================

-- =====================================================
-- 📋 محتويات الملف
-- =====================================================
-- 1. حذف السياسات (Policies)
-- 2. حذف الدوال (Functions)
-- 3. حذف الفهارس (Indexes)
-- 4. حذف الجدول (Table)
-- =====================================================


-- =====================================================
-- 1️⃣ حذف السياسات (Policies)
-- =====================================================

DROP POLICY IF EXISTS "password_reset_tokens_no_public_read" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "password_reset_tokens_service_full_access" ON public.password_reset_tokens;


-- =====================================================
-- 2️⃣ حذف الدوال (Functions)
-- =====================================================

DROP FUNCTION IF EXISTS public.cleanup_expired_reset_tokens();
DROP FUNCTION IF EXISTS public.verify_password_reset_token(TEXT);
DROP FUNCTION IF EXISTS public.claim_password_reset_token(TEXT);
DROP FUNCTION IF EXISTS public.create_password_reset_token(UUID, TEXT, INTEGER, INET);


-- =====================================================
-- 3️⃣ حذف الفهارس (Indexes)
-- =====================================================

DROP INDEX IF EXISTS idx_password_reset_tokens_created_at;
DROP INDEX IF EXISTS idx_password_reset_tokens_expires_at;
DROP INDEX IF EXISTS idx_password_reset_tokens_email;
DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;
DROP INDEX IF EXISTS idx_password_reset_tokens_token;


-- =====================================================
-- 4️⃣ حذف الجدول (Table)
-- =====================================================

DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;


-- =====================================================
-- ✅ نهاية الملف
-- =====================================================
