-- =====================================================
-- 🧪 إنشاء مستخدمين اختباريين (للتطوير فقط - لا للإنتاج!)
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف سابعاً (اختياري)
--    بعد: 005_Trigger Functions/000_trigger_functions.sql
-- =====================================================
-- ⚠️ تحذير: هذا الملف للاختبار فقط - لا تشغله في بيئة الإنتاج!
-- =====================================================
-- ✅ آمن للتشغيل المتكرر: يتحقق من وجود الإيميل قبل الإدراج
-- =====================================================

DO $$
BEGIN
  -- المستخدم 1: أحمد محمد (Admin)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test1@example.com') THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, raw_user_meta_data,
      email_confirmed_at, created_at, updated_at, role, aud
    ) VALUES (
      gen_random_uuid(),
      'test1@example.com',
      crypt('123456', gen_salt('bf')),
      '{"first_name": "أحمد", "last_name": "محمد", "avatar_url": "https://example.com/avatar.jpg"}'::jsonb,
      NOW(), NOW(), NOW(),
      'authenticated', 'authenticated'
    );
  END IF;

  -- المستخدم 2: سارة علي (Customer)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test2@example.com') THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, raw_user_meta_data,
      email_confirmed_at, created_at, updated_at, role, aud
    ) VALUES (
      gen_random_uuid(),
      'test2@example.com',
      crypt('123456', gen_salt('bf')),
      '{"first_name": "سارة", "last_name": "علي"}'::jsonb,
      NOW(), NOW(), NOW(),
      'authenticated', 'authenticated'
    );
  END IF;

  -- المستخدم 3: خالد حسن (Vendor)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test3@example.com') THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, raw_user_meta_data,
      email_confirmed_at, created_at, updated_at, role, aud
    ) VALUES (
      gen_random_uuid(),
      'test3@example.com',
      crypt('123456', gen_salt('bf')),
      '{"first_name": "خالد", "last_name": "حسن"}'::jsonb,
      NOW(), NOW(), NOW(),
      'authenticated', 'authenticated'
    );
  END IF;
END $$;

-- ✅ عرض المستخدمين الاختباريين
SELECT id, email,
       raw_user_meta_data->>'first_name' AS first_name,
       raw_user_meta_data->>'last_name' AS last_name,
       email_confirmed_at
FROM auth.users
WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
ORDER BY email;
