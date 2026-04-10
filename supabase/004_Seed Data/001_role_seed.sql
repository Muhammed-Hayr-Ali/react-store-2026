-- =====================================================
-- 🌱 Seed Data - الأدوار والصلاحيات
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف رابعاً
--    بعد: 003_RLS Policies/000_rls_policies.sql
-- =====================================================
-- متوافق مع جدول core_role
-- =====================================================

INSERT INTO public.core_role ("code", "description", "permissions", "created_at", "updated_at")
VALUES
  -- 👑 Admin - مدير النظام
  ('admin'::role_name, 
   'صلاحيات كاملة للوصول إلى جميع أجزاء النظام',
   '["*:*", "users:manage", "system:config", "reports:all", "analytics:full", "roles:manage", "settings:manage"]'::jsonb,
   NOW(), NOW()),

  -- 🏪 Vendor - البائع
  ('vendor'::role_name, 
   'إدارة المنتجات والطلبات للمتجر',
   '["products:create", "products:update", "products:delete", "products:read", "orders:read_own", "orders:update_status", "profile:update", "inventory:manage", "analytics:own", "reviews:reply"]'::jsonb,
   NOW(), NOW()),

  -- 🚚 Delivery - سائق التوصيل
  ('delivery'::role_name, 
   'إدارة مهام التوصيل وتحديث حالات الطلبات',
   '["deliveries:accept", "deliveries:update", "deliveries:complete", "deliveries:read", "orders:read_assigned", "orders:update_delivery", "profile:update", "earnings:view"]'::jsonb,
   NOW(), NOW()),

  -- 🛒 Customer - العميل
  ('customer'::role_name, 
   'تصفح المنتجات وإنشاء الطلبات',
   '["products:read", "orders:create", "orders:read_own", "profile:update", "reviews:create", "wishlist:manage", "addresses:manage"]'::jsonb,
   NOW(), NOW()),

  -- 🎧 Support - الدعم الفني (دور إضافي)
  ('support'::role_name, 
   'إدارة تذاكر الدعم والاستفسارات',
   '["tickets:read", "tickets:update", "tickets:assign", "orders:read", "users:read_basic", "notifications:send"]'::jsonb,
   NOW(), NOW())

ON CONFLICT ("code") DO UPDATE
SET 
  "description" = EXCLUDED."description",
  "permissions" = EXCLUDED."permissions",
  "updated_at" = NOW();




-- ✅ التحقق من نجاح الإدراج

  SELECT 
  code, 
  description, 
  jsonb_array_length(permissions) AS permission_count,
  created_at
FROM core_role
ORDER BY code;


