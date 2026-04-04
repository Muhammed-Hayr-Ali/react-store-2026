-- =====================================================
-- 🌱 تعديل خطط الاشتراك (SaaS Plans)
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف خامساً
--    بعد: 004_Seed Data/001_role_seed.sql
-- =====================================================

-- 1️⃣ إضافة أسعار الصرف المطلوبة (قبل الخطط)
INSERT INTO "exchange_rates" ("currency_code", "rate_from_usd", "last_updated_at")
VALUES
  ('USD', 1.000000, NOW()),
  ('SAR', 3.750000, NOW()),
  ('AED', 3.672500, NOW()),
  ('EGP', 30.900000, NOW()),
  ('KWD', 0.307000, NOW()),
  ('QAR', 3.640000, NOW()),
  ('BHD', 0.376000, NOW()),
  ('OMR', 0.385000, NOW()),
  ('JOD', 0.709000, NOW()),
  ('EUR', 0.920000, NOW()),
  ('GBP', 0.790000, NOW())
ON CONFLICT ("currency_code") DO UPDATE
SET 
  "rate_from_usd" = EXCLUDED."rate_from_usd",
  "last_updated_at" = EXCLUDED."last_updated_at";

-- 2️⃣ إضافة القيد الفريد للخطط (مطلوب لـ ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'saas_plan_category_name_unique'
      AND conrelid = 'saas_plan'::regclass
  ) THEN
    ALTER TABLE "saas_plan" 
    ADD CONSTRAINT "saas_plan_category_name_unique" 
    UNIQUE ("category", "name_ar");
  END IF;
END $$;

-- =====================================================
-- 3️⃣ خطط البائعين (Seller Plans) - 4 خطط
-- =====================================================

INSERT INTO public.saas_plan (
  "category",
  "name_ar",
  "name_en",
  "price",
  "price_usd",
  "currency",
  "billing_cycle",
  "features",
  "permissions",
  "is_digital",
  "is_shippable",
  "requires_prescription",
  "is_active",
  "sort_order"
)
VALUES
  -- 🆓 Free Seller
  ('seller'::plan_category,
   'بائع مجاني',
   'Free Seller',
   0.00, 0.00, 'USD', 'lifetime',
   '["عدد محدود من المنتجات (10)", "عمولة 5% على المبيعات", "دعم أساسي عبر البريد", "لوحة تحكم أساسية"]'::jsonb,
   '["products:read", "products:create", "products:update", "orders:read", "orders:update_status", "reviews:read", "reviews:reply", "analytics:basic"]'::jsonb,
   false, true, false, true, 1),

  -- 💼 Starter Seller
  ('seller'::plan_category,
   'بائع مبتدئ',
   'Starter Seller',
   29.99, 29.99, 'USD', 'yearly',
   '["منتجات غير محدودة", "عمولة 3% على المبيعات", "دعم ذو أولوية", "إحصائيات المبيعات", "إدارة المخزون", "عروض وخصومات"]'::jsonb,
   '["products:read", "products:create", "products:update", "products:delete", "orders:read", "orders:update_status", "orders:export", "reviews:read", "reviews:reply", "analytics:basic", "analytics:advanced", "inventory:manage", "promotions:manage"]'::jsonb,
   false, true, false, true, 2),

  -- 🚀 Professional Seller
  ('seller'::plan_category,
   'بائع محترف',
   'Professional Seller',
   59.99, 59.99, 'USD', 'yearly',
   '["كل ميزات Starter", "عمولة 2% على المبيعات", "تصدير الطلبات", "تحليلات متقدمة", "دعم فني 24/7", "إدارة فروع متعددة (3)"]'::jsonb,
   '["products:read", "products:create", "products:update", "products:delete", "orders:read", "orders:update_status", "orders:export", "orders:refund", "reviews:read", "reviews:reply", "analytics:basic", "analytics:advanced", "analytics:export", "inventory:manage", "promotions:manage", "branches:manage", "staff:manage"]'::jsonb,
   false, true, false, true, 3),

  -- 🏢 Enterprise Seller
  ('seller'::plan_category,
   'بائع مؤسسات',
   'Enterprise Seller',
   99.99, 99.99, 'USD', 'yearly',
   '["كل ميزات Professional", "عمولة 1% على المبيعات", "API كامل", "دعم مخصص 24/7", "فروع غير محدودة", "تقارير مخصصة", "موظفين غير محدودين"]'::jsonb,
   '["products:read", "products:create", "products:update", "products:delete", "orders:read", "orders:update_status", "orders:export", "orders:refund", "reviews:read", "reviews:reply", "reviews:delete", "analytics:basic", "analytics:advanced", "analytics:export", "analytics:custom", "inventory:manage", "promotions:manage", "branches:manage", "staff:manage", "api:full_access", "webhooks:manage"]'::jsonb,
   false, true, false, true, 4)

ON CONFLICT ("category", "name_ar") DO UPDATE
SET 
  "price" = EXCLUDED."price",
  "price_usd" = EXCLUDED."price_usd",
  "billing_cycle" = EXCLUDED."billing_cycle",
  "features" = EXCLUDED."features",
  "permissions" = EXCLUDED."permissions",
  "is_shippable" = EXCLUDED."is_shippable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = NOW();

-- =====================================================
-- 4️⃣ خطط التوصيل (Delivery Plans) - 3 خطط
-- =====================================================

INSERT INTO public.saas_plan (
  "category",
  "name_ar",
  "name_en",
  "price",
  "price_usd",
  "currency",
  "billing_cycle",
  "features",
  "permissions",
  "is_digital",
  "is_shippable",
  "requires_prescription",
  "is_active",
  "sort_order"
)
VALUES
  -- 🆓 Free Delivery Partner
  ('delivery'::plan_category,
   'شريك توصيل مجاني',
   'Free Delivery Partner',
   0.00, 0.00, 'USD', 'lifetime',
   '["قبول الطلبات المتاحة", "تتبع التوصيل الأساسي", "عرض الأرباح", "دعم أساسي"]'::jsonb,
   '["deliveries:read", "deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:track", "earnings:view", "analytics:basic"]'::jsonb,
   false, false, false, true, 1),

  -- 💼 Starter Delivery Partner
  ('delivery'::plan_category,
   'شريك توصيل مبتدئ',
   'Starter Delivery Partner',
   29.99, 29.99, 'USD', 'yearly',
   '["كل ميزات Free", "جدولة التوصيل", "أولوية في توزيع الطلبات", "إشعارات فورية", "دعم ذو أولوية"]'::jsonb,
   '["deliveries:read", "deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:track", "deliveries:schedule", "earnings:view", "earnings:export", "analytics:basic", "analytics:advanced", "priority:enabled", "notifications:instant"]'::jsonb,
   false, false, false, true, 2),

  -- 🚀 Professional Delivery Partner
  ('delivery'::plan_category,
   'شريك توصيل محترف',
   'Professional Delivery Partner',
   49.99, 49.99, 'USD', 'yearly',
   '["كل ميزات Starter", "تصدير الأرباح", "تقارير متقدمة", "دعم فني 24/7", "مناطق توصيل متعددة"]'::jsonb,
   '["deliveries:read", "deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:track", "deliveries:schedule", "earnings:view", "earnings:export", "analytics:basic", "analytics:advanced", "analytics:export", "priority:enabled", "notifications:instant", "zones:manage"]'::jsonb,
   false, false, false, true, 3)

ON CONFLICT ("category", "name_ar") DO UPDATE
SET 
  "price" = EXCLUDED."price",
  "price_usd" = EXCLUDED."price_usd",
  "billing_cycle" = EXCLUDED."billing_cycle",
  "features" = EXCLUDED."features",
  "permissions" = EXCLUDED."permissions",
  "is_shippable" = EXCLUDED."is_shippable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = NOW();

-- =====================================================
-- 5️⃣ خطط إضافية (Free & Enterprise) - 2 خطة
-- =====================================================

INSERT INTO public.saas_plan (
  "category",
  "name_ar",
  "name_en",
  "price",
  "price_usd",
  "currency",
  "billing_cycle",
  "features",
  "permissions",
  "is_digital",
  "is_shippable",
  "requires_prescription",
  "is_active",
  "sort_order"
)
VALUES
  -- 🆓 Free Plan (للعملاء)
  ('free'::plan_category,
   'خطة مجانية',
   'Free Plan',
   0.00, 0.00, 'USD', 'monthly',
   '["تصفح المنتجات", "إنشاء طلبات", "إدارة العناوين", "دعم أساسي", "إشعارات الطلبات"]'::jsonb,
   '["products:read", "products:search", "orders:read", "orders:create", "orders:track", "reviews:read", "reviews:create", "profile:read", "profile:update", "addresses:manage", "favorites:manage", "notifications:read"]'::jsonb,
   false, false, false, true, 0),

  -- 🏢 Enterprise Plan (للمؤسسات الكبيرة)
  ('enterprise'::plan_category,
   'خطة المؤسسات',
   'Enterprise Plan',
   299.99, 299.99, 'USD', 'monthly',
   '["كل الميزات", "API كامل", "دعم مخصص 24/7", "تقارير مخصصة", "فروع غير محدودة", "موظفين غير محدودين", "تكامل مع أنظمة خارجية"]'::jsonb,
   '["*:*", "api:full_access", "webhooks:manage", "reports:custom", "reports:export", "branches:unlimited", "staff:unlimited", "integrations:manage", "priority:support", "sla:guaranteed"]'::jsonb,
   false, true, false, true, 5)

ON CONFLICT ("category", "name_ar") DO UPDATE
SET 
  "price" = EXCLUDED."price",
  "price_usd" = EXCLUDED."price_usd",
  "billing_cycle" = EXCLUDED."billing_cycle",
  "features" = EXCLUDED."features",
  "permissions" = EXCLUDED."permissions",
  "is_shippable" = EXCLUDED."is_shippable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = NOW();

-- =====================================================
-- 6️⃣ التحقق من البيانات
-- =====================================================

-- عرض أسعار الصرف
SELECT currency_code, rate_from_usd FROM exchange_rates ORDER BY currency_code;

-- عرض ملخص الخطط
SELECT
  category,
  COUNT(*) AS plan_count,
  STRING_AGG(name_ar, ', ' ORDER BY sort_order) AS plan_names
FROM saas_plan
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- عرض تفاصيل جميع الخطط
SELECT
  id,
  category,
  name_ar,
  name_en,
  price,
  currency,
  billing_cycle,
  jsonb_array_length(permissions) AS permission_count,
  sort_order
FROM saas_plan
WHERE is_active = true
ORDER BY category, sort_order;

-- عرض الصلاحيات لكل خطة
SELECT
  category,
  name_ar,
  jsonb_array_elements_text(permissions) AS permission
FROM saas_plan
WHERE is_active = true
ORDER BY category, sort_order, permission;