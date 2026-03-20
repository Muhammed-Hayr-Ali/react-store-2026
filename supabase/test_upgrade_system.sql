-- =====================================================
-- Marketna E-Commerce - اختبار نظام ترقية الاشتراكات
-- File: test_upgrade_system.sql
-- Description: اختبارات شاملة لنظام ترقية الاشتراكات
-- User: m.thelord963@gmail.com (UID: 3e3a7862-ebfb-48e8-8727-a29b77c36978)
-- =====================================================

-- =====================================================
-- 1. التحقق من الجداول والخطط
-- =====================================================

-- 1.1 عرض جميع جداول النظام
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (table_name LIKE '%subscription%' OR table_name LIKE '%upgrade%')
ORDER BY table_name;

-- 1.2 عرض خطط الاشتراك المتاحة
SELECT 
  name,
  name_ar,
  price_usd,
  max_products,
  is_active,
  is_popular,
  billing_period
FROM seller_subscription_plans
WHERE plan_type = 'seller'
ORDER BY sort_order;

-- =====================================================
-- 2. التحقق من البائع وإنشائه
-- =====================================================

-- 2.1 عرض معلومات البائع الحالي
SELECT 
  s.id,
  s.store_name,
  s.store_slug,
  s.email,
  s.account_status,
  s.created_at,
  u.email as user_email
FROM sellers s
JOIN auth.users u ON u.id = s.user_id
WHERE u.id = '3e3a7862-ebfb-48e8-8727-a29b77c36978';

-- 2.2 إذا لم يكن هناك بائع، أنشئ واحد مباشرة
-- (قم بتنفيذ هذا فقط إذا كانت النتيجة فارغة من 2.1)
INSERT INTO sellers (
  user_id,
  store_name,
  store_slug,
  store_description,
  phone,
  email,
  address,
  tax_number,
  commercial_registration,
  account_status
) VALUES (
  '3e3a7862-ebfb-48e8-8727-a29b77c36978',  -- User ID الخاص بك
  'متجر الاختبار',
  'متجر-الاختبار-3e3a7862',
  'متجر مخصص للاختبار والتجربة',
  '0501234567',
  'm.thelord963@gmail.com',
  '{"street": "شارع التخصصي", "city": "الرياض", "country": "السعودية"}'::jsonb,
  '123456789',
  '1010101010',
  'active'  -- مفعل مباشرة للاختبار
)
ON CONFLICT (user_id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  email = EXCLUDED.email;

-- 2.3 التحقق من إنشاء البائع
SELECT id as seller_id, store_name, account_status
FROM sellers
WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978';

-- =====================================================
-- 3. اختبار إنشاء طلب ترقية
-- =====================================================

-- 3.1 إنشاء طلب ترقية
SELECT public.create_upgrade_request(
  (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978'),
  (SELECT id FROM seller_subscription_plans WHERE name = 'silver' AND plan_type = 'seller'),
  'email',
  'm.thelord963@gmail.com',
  'طلب تجربة لاختبار النظام'
) as request_id;

-- 3.2 عرض الطلبات الحالية
SELECT 
  rur.id,
  s.store_name,
  cp.name as current_plan,
  tp.name as target_plan,
  tp.price_usd,
  rur.status,
  rur.contact_method,
  rur.contact_value,
  rur.seller_notes,
  rur.created_at
FROM seller_upgrade_requests rur
JOIN sellers s ON s.id = rur.seller_id
LEFT JOIN seller_subscription_plans cp ON cp.id = rur.current_plan_id
JOIN seller_subscription_plans tp ON tp.id = rur.target_plan_id
WHERE rur.seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
ORDER BY rur.created_at DESC;

-- =====================================================
-- 4. اختبار دوال الإدارة (للأدمن فقط)
-- =====================================================

-- 4.1 الموافقة على طلب (يجب أن تكون مسجل كأدمن)
-- نفذ هذا فقط إذا كنت مسجل دخول كأدمن
/*
SELECT public.approve_upgrade_request(
  (SELECT id FROM seller_upgrade_requests 
   WHERE seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
   ORDER BY created_at DESC LIMIT 1),
  'تمت الموافقة على الطلب للاختبار'
);
*/

-- 4.2 عرض الطلبات بعد التعديل
SELECT 
  rur.id,
  s.store_name,
  tp.name as target_plan,
  rur.status,
  rur.admin_notes,
  rur.contacted_at
FROM seller_upgrade_requests rur
JOIN sellers s ON s.id = rur.seller_id
JOIN seller_subscription_plans tp ON tp.id = rur.target_plan_id
ORDER BY rur.created_at DESC;

-- 4.3 إكمال الترقية (بعد الدفع)
-- نفذ هذا فقط إذا كنت مسجل دخول كأدمن
/*
SELECT public.complete_upgrade_request(
  (SELECT id FROM seller_upgrade_requests 
   WHERE seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
   ORDER BY created_at DESC LIMIT 1)
);
*/

-- =====================================================
-- 5. التحقق من الاشتراكات
-- =====================================================

-- 5.1 عرض اشتراكات البائع الحالية
SELECT 
  ss.id,
  s.store_name,
  sp.name as plan_name,
  sp.price_usd,
  ss.status,
  ss.start_date,
  ss.end_date,
  ss.payment_provider
FROM seller_subscriptions ss
JOIN sellers s ON s.id = ss.seller_id
JOIN seller_subscription_plans sp ON sp.id = ss.plan_id
WHERE ss.seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
ORDER BY ss.created_at DESC;

-- 5.2 عرض جميع الاشتراكات النشطة
SELECT 
  s.store_name,
  sp.name as plan_name,
  sp.price_usd,
  ss.status,
  ss.end_date
FROM seller_subscriptions ss
JOIN sellers s ON s.id = ss.seller_id
JOIN seller_subscription_plans sp ON sp.id = ss.plan_id
WHERE ss.status = 'active'
ORDER BY ss.created_at DESC;

-- =====================================================
-- 6. اختبار دوال البائع
-- =====================================================

-- 6.1 التحقق من حد المنتجات
SELECT public.can_add_product(
  (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
) as can_add_product;

-- 6.2 الحصول على اشتراك البائع الحالي
SELECT * FROM public.get_seller_subscription(
  (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978')
);

-- =====================================================
-- 7. إحصائيات
-- =====================================================

-- 7.1 عدد الطلبات حسب الحالة
SELECT 
  status,
  COUNT(*) as count
FROM seller_upgrade_requests
GROUP BY status;

-- 7.2 معدل التحويلات
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) as total,
  ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM seller_upgrade_requests;

-- 7.3 الإيرادات من الترقيات
SELECT 
  SUM(ss.amount_paid) as total_revenue,
  COUNT(*) as total_upgrades,
  AVG(ss.amount_paid) as avg_revenue
FROM seller_subscriptions ss
JOIN seller_upgrade_requests sur ON sur.seller_id = ss.seller_id
WHERE sur.status = 'completed';

-- =====================================================
-- 8. تنظيف البيانات (اختياري)
-- =====================================================

-- لحذف جميع طلبات الاختبار:
/*
DELETE FROM seller_upgrade_requests
WHERE seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978');
*/

-- لحذف اشتراكات الاختبار:
/*
DELETE FROM seller_subscriptions
WHERE seller_id = (SELECT id FROM sellers WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978');
*/

-- لحذف البائع (احذر!):
/*
DELETE FROM sellers
WHERE user_id = '3e3a7862-ebfb-48e8-8727-a29b77c36978';
*/

-- =====================================================
-- ملاحظات:
-- =====================================================
-- 1. الأقسام بين /* */ تحتاج صلاحيات أدمن
-- 2. يمكنك حفظ هذا الملف وتشغيله في Supabase Dashboard
-- 3. User ID: 3e3a7862-ebfb-48e8-8727-a29b77c36978
-- 4. البريد: m.thelord963@gmail.com

-- =====================================================
-- روابط مفيدة:
-- =====================================================
-- Supabase Dashboard: https://app.supabase.com
-- SQL Editor: https://app.supabase.com/project/_sql
-- Authentication: https://app.supabase.com/project/auth/users
-- Database: https://app.supabase.com/project/editor
