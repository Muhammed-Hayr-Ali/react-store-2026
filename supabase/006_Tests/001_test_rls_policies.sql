-- =====================================================
-- 🧪 RLS Policy Tests - اختبارات سياسات الأمان
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف سادساً
--    بعد: 005_Trigger Functions/000_trigger_functions.sql
-- =====================================================
-- 📋 هذا الملف يحتوي على اختبارات للتحقق من صحة سياسات RLS
-- 🔴 تحذير: لا تشغّل هذا الملف في بيئة الإنتاج!
-- =====================================================

-- ملاحظة: هذه الاختبارات تتطلب وجود بيانات أدوار من 004_Seed Data
-- =====================================================

BEGIN;

-- =====================================================
-- 1️⃣ إعداد بيئة الاختبار
-- =====================================================

-- إنشاء مستخدمين اختباريين (محاكاة)
-- نستخدم دوال مباشرة لأننا لا نستطيع إنشاء auth.users يدوياً بسهولة

-- التحقق من أن RLS مفعّل على جميع الجداول
DO $$
DECLARE
  v_table RECORD;
  v_has_rls BOOLEAN;
  v_table_name TEXT;
BEGIN
  FOR v_table IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    v_table_name := v_table.tablename;

    SELECT relrowsecurity
    INTO v_has_rls
    FROM pg_class
    WHERE oid = ('public.' || v_table_name)::regclass;

    RAISE NOTICE '✅ جدول %: RLS = %', v_table_name, v_has_rls;
  END LOOP;
END $$;

-- =====================================================
-- 2️⃣ اختبار الدوال المساعدة
-- =====================================================

-- اختبار current_user_id()
DO $$
BEGIN
  -- يجب أن ترجع NULL خارج جلسة المصادقة
  IF public.current_user_id() IS NULL THEN
    RAISE NOTICE '✅ current_user_id() ترجع NULL خارج الجلسة (متوقع)';
  ELSE
    RAISE WARNING '⚠️ current_user_id() أرجعت قيمة غير متوقعة';
  END IF;
END $$;

-- اختبار is_admin() بدون مستخدم
DO $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE NOTICE '✅ is_admin() ترجع false بدون مستخدم (متوقع)';
  ELSE
    RAISE WARNING '⚠️ is_admin() أرجعت true بدون مستخدم';
  END IF;
END $$;

-- =====================================================
-- 3️⃣ اختبار السياسات الأساسية
-- =====================================================

-- التحقق من وجود سياسات RLS على الجداول
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname
LIMIT 20;

-- عدّ السياسات لكل جدول
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- =====================================================
-- 4️⃣ اختبار الوصول العام (بدون مصادقة)
-- =====================================================

-- هذه الاختبارات تعتمد على إعدادات PostgreSQL المحلية
DO $$
BEGIN
  RAISE NOTICE '=== 🧪 اختبارات الوصول العام ===';
END $$;

-- التحقق من أن البيانات العامة مرئية (منتجات نشطة)
-- هذا يعتمد على السياسات المحددة
SELECT COUNT(*) AS active_products
FROM store_product
WHERE is_active = true AND deleted_at IS NULL;

-- التحقق من أن التصنيفات النشطة مرئية
SELECT COUNT(*) AS active_categories
FROM store_category
WHERE is_active = true;

-- التحقق من أن إعدادات المتجر النشطة مرئية
SELECT COUNT(*) AS active_stores
FROM store_settings
WHERE is_active = true;

-- =====================================================
-- 5️⃣ اختبار سلامة المفاتيح الخارجية
-- =====================================================

-- التحقق من عدم وجود أيتام (orphans)
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- عناصر طلب بدون طلب
  SELECT COUNT(*) INTO orphan_count
  FROM trade_order_item toi
  LEFT JOIN trade_order to2 ON toi.order_id = to2.id
  WHERE to2.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE WARNING '⚠️ يوجد % عنصر طلب بدون طلب', orphan_count;
  ELSE
    RAISE NOTICE '✅ لا يوجد عناصر طلب يتيمة';
  END IF;
  
  -- صور منتجات بدون منتج
  SELECT COUNT(*) INTO orphan_count
  FROM product_image pi
  LEFT JOIN store_product sp ON pi.product_id = sp.id
  WHERE sp.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE WARNING '⚠️ يوجد % صورة بدون منتج', orphan_count;
  ELSE
    RAISE NOTICE '✅ لا يوجد صور يتيمة';
  END IF;
  
  -- متغيرات بدون منتج
  SELECT COUNT(*) INTO orphan_count
  FROM product_variant pv
  LEFT JOIN store_product sp ON pv.product_id = sp.id
  WHERE sp.id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE WARNING '⚠️ يوجد % متغير بدون منتج', orphan_count;
  ELSE
    RAISE NOTICE '✅ لا يوجد متغيرات يتيمة';
  END IF;
END $$;

-- =====================================================
-- 6️⃣ اختبار الفهارس
-- =====================================================

-- عدّ الفهارس لكل جدول
SELECT
  t.tablename,
  COUNT(i.indexname) AS index_count
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND t.schemaname = i.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY index_count DESC, t.tablename;

-- =====================================================
-- 7️⃣ اختبار المشغلات (Triggers)
-- =====================================================

SELECT
  trigger_schema,
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- عدّ المشغلات
SELECT
  event_object_table AS table_name,
  COUNT(*) AS trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY trigger_count DESC, table_name;

-- =====================================================
-- 8️⃣ اختبار الدوال (Functions)
-- =====================================================

SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- =====================================================
-- 📊 ملخص النتائج
-- =====================================================

DO $$
DECLARE
  policy_count INTEGER;
  table_count INTEGER;
  index_count INTEGER;
  trigger_count INTEGER;
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO table_count FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
  SELECT COUNT(DISTINCT trigger_name) INTO trigger_count 
    FROM information_schema.triggers WHERE trigger_schema = 'public';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name NOT LIKE 'pg_%';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 ملخص قاعدة البيانات:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 جداول: %', table_count;
  RAISE NOTICE '🔒 سياسات RLS: %', policy_count;
  RAISE NOTICE '📑 فهارس: %', index_count;
  RAISE NOTICE '⚡ مشغلات: %', trigger_count;
  RAISE NOTICE '🔧 دوال: %', function_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ اكتملت الاختبارات الأساسية';
  RAISE NOTICE '';
  RAISE NOTICE '🔴 ملاحظة: اختبارات RLS الكاملة تتطلب جلسة مستخدم';
  RAISE NOTICE '   استخدم Supabase Dashboard أو تطبيق الاختبار';
  RAISE NOTICE '========================================';
END $$;

-- إنهاء المعاملة بدون حفظ (ROLLBACK للتجربة فقط)
-- ALTER هذا للاختبار - احذف هذا السطر إذا كنت تريد حفظ التغييرات
ROLLBACK;

-- =====================================================
-- ✅ END OF TESTS
-- =====================================================
