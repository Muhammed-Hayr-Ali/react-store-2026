-- =====================================================
-- 🧪 Comprehensive RLS Policy Tests - اختبار شامل للسياسات
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف ثامناً (اختياري)
--    بعد: جميع الملفات الأخرى
-- =====================================================
-- ⚠️ هذا الملف للاختبار فقط - لا تشغله في بيئة الإنتاج!
-- =====================================================
-- 📋 طريقة الاستخدام:
-- 1. تأكد من تشغيل الملفات بالترتيب:
--    - 001_Schema/001_schema.sql
--    - 002_Utility Functions/000_utility_functions.sql
--    - 003_RLS Policies/002_rls_policies.sql
--    - 004_Seed Data/001_role_seed.sql
--    - 004_Seed Data/002_plan_seed.sql
--    - 005_Trigger Functions/000_trigger_functions.sql
--    - 005_Trigger Functions/002_create_test_user.sql
--
-- 2. أنشئ مستخدمين اختباريين (أو استخدم مستخدمين حقيقيين)
--
-- 3. شغّل هذا الملف وتحقق من النتائج
-- =====================================================

-- =====================================================
-- 📊 إعداد بيئة الاختبار
-- =====================================================

-- عرض جميع السياسات الموجودة
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- عرض عدد السياسات لكل جدول
SELECT
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- التحقق من تفعيل RLS على جميع الجداول
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- =====================================================
-- 🧪 اختبار الدوال المساعدة (Helper Functions)
-- =====================================================

-- ⚠️ ملاحظة: هذه الاختبارات تتطلب مستخدمين حقيقيين
-- يمكنك تشغيلها بعد تسجيل الدخول كمستخدم معين

-- اختبار 1: التحقق من وجود الدوال
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_admin',
    'current_user_id',
    'has_role',
    'is_vendor',
    'is_delivery',
    'get_vendor_id',
    'is_store_owner',
    'is_product_owner'
  )
ORDER BY routine_name;

-- اختبار 2: التحقق من صلاحيات الدوال (SECURITY DEFINER)
SELECT
  proname AS function_name,
  prosecdef AS security_definer
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'is_admin',
    'get_current_user_id',
    'has_role',
    'is_vendor',
    'is_delivery',
    'get_vendor_id',
    'is_store_owner',
    'is_product_owner'
  )
ORDER BY proname;

-- =====================================================
-- 🧪 اختبار جدول الأدوار (core_role)
-- =====================================================

-- اختبار 3: التحقق من وجود الأدوار الخمسة
SELECT
  code,
  description IS NOT NULL AS has_description,
  jsonb_array_length(permissions) AS permission_count,
  created_at IS NOT NULL AS has_created_at
FROM public.core_role
ORDER BY code;

-- النتيجة المتوقعة: 5 صفوف (admin, vendor, customer, delivery, support)

-- اختبار 4: التحقق من صلاحيات الأدمن
SELECT
  code,
  permissions @> '["*:*"]' AS has_full_access
FROM public.core_role
WHERE code = 'admin';

-- النتيجة المتوقعة: true

-- اختبار 5: التحقق من صلاحيات العميل
SELECT
  code,
  permissions @> '["products:read"]' AS can_read_products,
  permissions @> '["orders:create"]' AS can_create_orders
FROM public.core_role
WHERE code = 'customer';

-- النتيجة المتوقعة: true, true

-- =====================================================
-- 🧪 اختبار جدول الملف الشخصي (core_profile)
-- =====================================================

-- اختبار 6: التحقق من الأعمدة المحسوبة (full_name)
INSERT INTO public.core_profile (id, email, first_name, last_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'أحمد', 'محمد')
ON CONFLICT (id) DO NOTHING;

SELECT
  id,
  email,
  first_name,
  last_name,
  full_name,
  full_name = 'أحمد محمد' AS full_name_correct
FROM public.core_profile
WHERE id = '00000000-0000-0000-0000-000000000001';

-- النتيجة المتوقعة: full_name_correct = true

-- =====================================================
-- 🧪 اختبار جدول المتاجر (store_vendor)
-- =====================================================

-- اختبار 7: التحقق من القيود (CHECK constraints)
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.store_vendor'::regclass
  AND contype = 'c'
ORDER BY conname;

-- النتيجة المتوقعة: قيود على rating_avg, review_count, sales_count, default_currency

-- =====================================================
-- 🧪 اختبار جدول المنتجات (store_product)
-- =====================================================

-- اختبار 8: التحقق من قيود السعر
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.store_product'::regclass
  AND contype = 'c'
  AND conname LIKE '%price%';

-- النتيجة المتوقعة: price_base >= 0, price_discount < price_base

-- =====================================================
-- 🧪 اختبار جدول الطلبات (trade_order)
-- =====================================================

-- اختبار 9: التحقق من القيود المالية
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.trade_order'::regclass
  AND contype = 'c'
ORDER BY conname;

-- النتيجة المتوقعة: قيود على items_total, delivery_fee, discount_amount, grand_total

-- =====================================================
-- 🧪 اختبار الفهارس (Indexes)
-- =====================================================

-- اختبار 10: عرض جميع الفهارس
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- اختبار 11: التحقق من الفهارس الفريدة (Unique Indexes)
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%UNIQUE%'
ORDER BY tablename;

-- النتيجة المتوقعة:
-- - core_profile.email
-- - core_profile.phone_number
-- - store_vendor.slug
-- - store_product (vendor_id, slug)
-- - social_review (author_id, product_id) WHERE product_id IS NOT NULL
-- - social_review (author_id, vendor_id) WHERE product_id IS NULL

-- =====================================================
-- 🧪 اختبار المفاتيح الخارجية (Foreign Keys)
-- =====================================================

-- اختبار 12: عرض جميع المفاتيح الخارجية
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- اختبار 13: التحقق من قيود ON DELETE
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND rc.delete_rule IN ('CASCADE', 'SET NULL', 'RESTRICT')
ORDER BY rc.delete_rule, tc.table_name;

-- =====================================================
-- 🧪 اختبار أنواع البيانات (ENUMs)
-- =====================================================

-- اختبار 14: عرض جميع أنواع ENUM
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- النتيجة المتوقعة: جميع القيم المحددة في المخطط

-- اختبار 15: التحقق من نوع role_name
SELECT
  enumlabel AS role_value
FROM pg_enum
WHERE enumtypid = 'public.role_name'::regtype
ORDER BY enumsortorder;

-- النتيجة المتوقعة: admin, vendor, customer, delivery, support

-- =====================================================
-- 🧪 اختبار السياسات حسب الجدول
-- =====================================================

-- اختبار 16: سياسات core_role
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'core_role'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - roles_public_viewable (SELECT)
-- - admins_manage_roles (ALL)

-- اختبار 17: سياسات core_profile_role
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'core_profile_role'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - users_view_own_roles (SELECT)
-- - admins_manage_profile_roles (ALL)

-- اختبار 18: سياسات saas_plan
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'saas_plan'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - plans_public_viewable (SELECT)
-- - admins_manage_plans (ALL)

-- اختبار 19: سياسات saas_subscription
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'saas_subscription'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - users_view_own_subscriptions (SELECT)
-- - users_insert_own_subscriptions (INSERT)
-- - users_update_own_subscriptions (UPDATE)
-- - admins_manage_subscriptions (ALL)

-- اختبار 20: سياسات store_category
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'store_category'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - categories_public_viewable (SELECT)
-- - vendors_manage_own_categories (ALL)
-- - admins_manage_all_categories (ALL)

-- اختبار 21: سياسات product_variant
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'product_variant'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - variants_public_viewable (SELECT)
-- - vendors_manage_own_variants (ALL)
-- - admins_manage_all_variants (ALL)

-- اختبار 22: سياسات fleet_driver
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'fleet_driver'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - drivers_view_own_profile (SELECT)
-- - drivers_update_own_profile (UPDATE)
-- - admins_manage_all_drivers (ALL)

-- اختبار 23: سياسات fleet_delivery
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'fleet_delivery'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - drivers_view_assigned_deliveries (SELECT)
-- - drivers_update_assigned_deliveries (UPDATE)
-- - vendors_view_own_deliveries (SELECT)
-- - admins_manage_all_deliveries (ALL)

-- اختبار 24: سياسات customer_favorite
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'customer_favorite'
ORDER BY policyname;

-- النتيجة المتوقعة:
-- - users_view_own_favorites (SELECT)
-- - users_manage_own_favorites (ALL)

-- =====================================================
-- 🧪 اختبار GRANT/REVOKE على core_profile
-- =====================================================

-- اختبار 25: التحقق من صلاحيات الأعمدة
SELECT
  grantee,
  privilege_type,
  column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'core_profile'
ORDER BY grantee, column_name, privilege_type;

-- =====================================================
-- 📈 ملخص الاختبارات
-- =====================================================

-- اختبار 26: إحصائيات عامة
SELECT
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies,
  (SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true) AS tables_with_rls,
  (SELECT COUNT(*) FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND contype = 'f') AS foreign_keys,
  (SELECT COUNT(*) FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND contype = 'c') AS check_constraints,
  (SELECT COUNT(*) FROM pg_index WHERE indisunique = true) AS unique_indexes,
  (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace) AS enum_types;

-- النتيجة المتوقعة:
-- - total_policies: 70+
-- - tables_with_rls: 23
-- - foreign_keys: 30+
-- - check_constraints: 20+
-- - unique_indexes: 10+
-- - enum_types: 10

-- =====================================================
-- ✅ تقرير الاختبار النهائي
-- =====================================================

-- اختبار 27: التحقق من عدم وجود جداول بدون سياسات
SELECT
  c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON c.relname = p.tablename AND p.schemaname = 'public'
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND p.policyname IS NULL
GROUP BY c.relname
ORDER BY c.relname;

-- النتيجة المتوقعة: لا شيء (0 صفوف)
-- إذا ظهرت جداول، فهذا يعني أنها بدون سياسات!

-- اختبار 28: التحقق من تغطية الأدمن لجميع الجداول
SELECT
  tablename,
  COUNT(*) FILTER (WHERE qual LIKE '%is_admin()%' OR with_check LIKE '%is_admin()%') AS admin_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) FILTER (WHERE qual LIKE '%is_admin()%' OR with_check LIKE '%is_admin()%') = 0
ORDER BY tablename;

-- النتيجة المتوقعة: لا شيء (0 صفوف)
-- إذا ظهرت جداول، فهذا يعني أن الأدمن ليس لديه صلاحيات عليها!

-- =====================================================
-- 🧹 تنظيف بيانات الاختبار (اختياري)
-- =====================================================

-- DELETE FROM public.core_profile WHERE id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- ✅ END OF TESTS
-- =====================================================

/*
📋 قائمة التحقق النهائية:

✅ جميع الجداول الـ 23 لديها RLS مفعّل
✅ جميع الجداول لديها سياسات كاملة
✅ الأدمن لديه صلاحيات على جميع الجداول
✅ المستخدمون يديرون بياناتهم فقط
✅ البائعون يديرون متاجرهم ومنتجاتهم فقط
✅ السائقون يديرون مهامهم فقط
✅ البيانات العامة متاحة للجميع
✅ الدوال المساعدة تعمل بشكل صحيح
✅ الفهارس موجودة وصحيحة
✅ المفاتيح الخارجية محددة بشكل صحيح
✅ القيود (CHECK) تعمل بشكل صحيح
✅ أنواع ENUM محددة بشكل صحيح

🎯 الخطوات التالية:
1. تشغيل الاختبارات في بيئة التطوير
2. التحقق من النتائج
3. إجراء التعديلات اللازمة
4. اختبار السيناريوهات الحقيقية مع مستخدمين حقيقيين
5. نشر التحديثات في الإنتاج
*/
