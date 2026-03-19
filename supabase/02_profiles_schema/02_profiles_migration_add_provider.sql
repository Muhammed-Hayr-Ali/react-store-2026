-- =====================================================
-- Migration: Add provider column to profiles table
-- File: 02_profiles_add_provider_column.sql
-- Date: 2026-03-19
-- Description: Add provider column and update existing records
-- =====================================================

-- 1. إضافة عمود provider إذا لم يكن موجوداً
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- 2. تحديث السجلات الموجودة لاستخراج provider من auth.users
UPDATE public.profiles p
SET provider = COALESCE(
  (SELECT au.raw_app_meta_data->>'provider'
   FROM auth.users au
   WHERE au.id = p.id),
  'email'
)
WHERE p.provider = 'email';

-- 3. تحديث الدالة handle_new_user لتشمل provider
-- (تم تحديثها بالفعل في 02_profiles_schema.sql)

-- 4. إضافة تعليق على العمود
COMMENT ON COLUMN public.profiles.provider IS 'مزود المصادقة: email, google, facebook, github, apple, etc.';

-- 5. إنشاء فهرس على عمود provider
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);

-- =====================================================
-- إصلاح البيانات الموجودة (Fix Existing Data)
-- =====================================================

-- تحديث first_name و last_name و avatar_url من Google OAuth للمستخدمين الحاليين
UPDATE public.profiles p
SET
  first_name = COALESCE(
    p.first_name,
    NULLIF(SPLIT_PART(
      COALESCE(
        (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
        (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
        ''
      ),
      ' ',
      1
    ), ''),
  last_name = COALESCE(
    p.last_name,
    NULLIF(TRIM(SUBSTRING(
      COALESCE(
        (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
        (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
        ''
      )
      FROM LENGTH(
        COALESCE(
          (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
          (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
          ''
        )
      ) - LENGTH(
        TRIM(SUBSTRING(
          COALESCE(
            (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
            (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
            ''
          )
          FROM POSITION(' ' IN 
            COALESCE(
              (SELECT au.raw_user_meta_data->>'full_name' FROM auth.users au WHERE au.id = p.id),
              (SELECT au.raw_user_meta_data->>'name' FROM auth.users au WHERE au.id = p.id),
              ''
            )
          ) + 1
        ))
      ) + 1
    )), ''),
  avatar_url = COALESCE(
    p.avatar_url,
    (SELECT au.raw_user_meta_data->>'avatar_url' FROM auth.users au WHERE au.id = p.id),
    (SELECT au.raw_user_meta_data->>'picture' FROM auth.users au WHERE au.id = p.id)
  )
WHERE EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);

-- =====================================================
-- End
-- =====================================================
