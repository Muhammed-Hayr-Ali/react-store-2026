-- =====================================================
-- 🔧 Utility Functions - الدوال المساعدة الموحدة
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف ثانياً
--    بعد: 001_Schema/001_schema.sql
--    قبل: 003_RLS Policies/002_rls_policies.sql
-- =====================================================
-- 📋 هذا الملف يحتوي على جميع الدوال المساعدة المستخدمة في:
--    - سياسات RLS (Row Level Security)
--    - التحقق من الصلاحيات
--    - إدارة الاشتراكات والخطط
-- =====================================================

-- =====================================================
-- 📌 القسم الأول: دوال التحقق من الهوية والأدوار
-- =====================================================

-- 1️⃣ دالة: معرف المستخدم الحالي
-- =====================================================
-- 🎯 الاستخدام: الحصول على UUID للمستخدم المسجل
-- 📝 ملاحظة: واجهة موحدة لـ auth.uid()

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_id() IS 'إرجاع معرف المستخدم الحالي من جلسة المصادقة';

-- 2️⃣ دالة: التحقق من دور معين (دالة أساسية)
-- =====================================================
-- 🎯 الاستخدام: has_role('admin') أو has_role('vendor')
-- ⚡ محسّنة: تستخدم EXISTS بدلاً من JOIN كامل

CREATE OR REPLACE FUNCTION public.has_role(p_role role_name)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = p_role
      )
  );
$$;

COMMENT ON FUNCTION public.has_role(p_role role_name) IS 'التحقق من وجود دور معين للمستخدم الحالي';

-- 3️⃣ دالة: التحقق من دور الأدمن
-- =====================================================
-- 🎯 الاستخدام: is_admin()
-- ⚡ محسّنة: مباشرة بدون استدعاء has_role()

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'admin'
      )
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'التحقق مما إذا كان المستخدم مدير النظام';

-- 4️⃣ دالة: التحقق من دور البائع
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'vendor'
      )
  );
$$;

COMMENT ON FUNCTION public.is_vendor() IS 'التحقق مما إذا كان المستخدم بائعاً';

-- 5️⃣ دالة: التحقق من دور السائق
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_delivery()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    WHERE cpr.profile_id = public.current_user_id()
      AND cpr.role_id IN (
        SELECT id FROM public.core_role WHERE code = 'delivery'
      )
  );
$$;

COMMENT ON FUNCTION public.is_delivery() IS 'التحقق مما إذا كان المستخدم سائق توصيل';

-- 6️⃣ دالة: الحصول على جميع أدوار المستخدم
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM get_user_roles()
-- 📊 ترجع جدول بجميع الأدوار النشطة

CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE (
  role_id uuid,
  role_code role_name,
  role_description text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT cr.id, cr.code, cr.description
  FROM public.core_profile_role cpr
  JOIN public.core_role cr ON cpr.role_id = cr.id
  WHERE cpr.profile_id = public.current_user_id();
$$;

COMMENT ON FUNCTION public.get_user_roles() IS 'إرجاع جميع أدوار المستخدم الحالي';

-- =====================================================
-- 📌 القسم الثاني: دوال التحقق من الصلاحيات
-- =====================================================

-- 7️⃣ دالة: التحقق من صلاحية معينة
-- =====================================================
-- 🎯 الاستخدام: has_permission('products:read')
-- 🔍 تتحقق من الصلاحية أو الصلاحية المطلقة '*:*'

CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.core_profile_role cpr
    JOIN public.core_role cr ON cpr.role_id = cr.id
    WHERE cpr.profile_id = public.current_user_id()
      AND (
        cr.permissions ? p_permission
        OR cr.permissions ? '*:*'
      )
  );
$$;

COMMENT ON FUNCTION public.has_permission(p_permission text) IS 'التحقق من وجود صلاحية معينة للمستخدم';

-- 8️⃣ دالة: الحصول على جميع صلاحيات المستخدم
-- =====================================================
-- 🎯 الاستخدام: SELECT get_user_permissions()
-- 📊 ترجع JSONB بجميع الصلاحيات (بدون تكرار)

CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_agg(DISTINCT perm)
      FROM public.core_profile_role cpr
      JOIN public.core_role cr ON cpr.role_id = cr.id,
      LATERAL jsonb_array_elements_text(cr.permissions) AS perm
      WHERE cpr.profile_id = public.current_user_id()
    ),
    '[]'::jsonb
  );
$$;

COMMENT ON FUNCTION public.get_user_permissions() IS 'إرجاع جميع صلاحيات المستخدم كمصفوفة JSONB';

-- =====================================================
-- 📌 القسم الثالث: دوال إدارة المتاجر والمنتجات
-- =====================================================

-- 9️⃣ دالة: الحصول على معرف متجر البائع
-- =====================================================
-- 🎯 الاستخدام: get_vendor_id()
-- ⚠️ ترجع NULL إذا لم يكن بائعاً أو المتجر محذوف

CREATE OR REPLACE FUNCTION public.get_vendor_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT sv.id
  FROM public.store_vendor sv
  WHERE sv.profile_id = public.current_user_id()
    AND sv.deleted_at IS NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_vendor_id() IS 'إرجاع معرف متجر البائع (NULL إذا لم يكن بائعاً)';

-- 🔟 دالة: التحقق من ملكية المتجر
-- =====================================================
-- 🎯 الاستخدام: is_store_owner('vendor-uuid')

CREATE OR REPLACE FUNCTION public.is_store_owner(p_vendor_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_vendor sv
    WHERE sv.id = p_vendor_id
      AND sv.profile_id = public.current_user_id()
      AND sv.deleted_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.is_store_owner(p_vendor_id uuid) IS 'التحقق من ملكية متجر معين';

-- 1️⃣1️⃣ دالة: التحقق من ملكية المنتج
-- =====================================================
-- 🎯 الاستخدام: is_product_owner('product-uuid')

CREATE OR REPLACE FUNCTION public.is_product_owner(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_product sp
    JOIN public.store_vendor sv ON sp.vendor_id = sv.id
    WHERE sp.id = p_product_id
      AND sv.profile_id = public.current_user_id()
      AND sv.deleted_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.is_product_owner(p_product_id uuid) IS 'التحقق من ملكية منتج معين';

-- =====================================================
-- 📌 القسم الرابع: دوال إدارة الاشتراكات والخطط
-- =====================================================

-- 1️⃣2️⃣ دالة: الحصول على خطة المستخدم الحالية
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM get_user_plan()
-- 📊 ترجع تفاصيل الخطة النشطة فقط

CREATE OR REPLACE FUNCTION public.get_user_plan()
RETURNS TABLE (
  plan_id uuid,
  category plan_category,
  name_ar text,
  name_en text,
  price numeric(10,2),
  currency varchar(3),
  billing_cycle text,
  permissions jsonb,
  features jsonb,
  status sub_status,
  starts_at timestamptz,
  ends_at timestamptz,
  auto_renew boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    sp.id,
    sp.category,
    sp.name_ar,
    sp.name_en,
    sp.price,
    sp.currency,
    sp.billing_cycle,
    sp.permissions,
    sp.features,
    ss.status,
    ss.starts_at,
    ss.ends_at,
    ss.auto_renew
  FROM public.saas_subscription ss
  JOIN public.saas_plan sp ON ss.plan_id = sp.id
  WHERE ss.profile_id = public.current_user_id()
    AND ss.status IN ('active', 'trialing')
    AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
  ORDER BY ss.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_plan() IS 'إرجاع تفاصيل خطة المستخدم النشطة';

-- 1️⃣3️⃣ دالة: التحقق من صلاحية الخطة
-- =====================================================
-- 🎯 الاستخدام: has_plan_permission('products:create')
-- 🔍 تتحقق من صلاحيات الخطة النشطة

CREATE OR REPLACE FUNCTION public.has_plan_permission(p_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.saas_subscription ss
    JOIN public.saas_plan sp ON ss.plan_id = sp.id
    WHERE ss.profile_id = public.current_user_id()
      AND ss.status IN ('active', 'trialing')
      AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      AND (
        sp.permissions ? p_permission
        OR sp.permissions ? '*:*'
      )
  );
$$;

COMMENT ON FUNCTION public.has_plan_permission(p_permission text) IS 'التحقق من صلاحية في خطة المستخدم';

-- 1️⃣4️⃣ دالة: الحصول على صلاحيات الخطة
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_plan_permissions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT COALESCE(
    (
      SELECT sp.permissions
      FROM public.saas_subscription ss
      JOIN public.saas_plan sp ON ss.plan_id = sp.id
      WHERE ss.profile_id = public.current_user_id()
        AND ss.status IN ('active', 'trialing')
        AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      ORDER BY ss.created_at DESC
      LIMIT 1
    ),
    '[]'::jsonb
  );
$$;

COMMENT ON FUNCTION public.get_plan_permissions() IS 'إرجاع صلاحيات خطة المستخدم النشطة';

-- 1️⃣5️⃣ دالة: التحقق من فئة الخطة
-- =====================================================
-- 🎯 الاستخدام: has_plan_category('seller')

CREATE OR REPLACE FUNCTION public.has_plan_category(p_category plan_category)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.saas_subscription ss
    JOIN public.saas_plan sp ON ss.plan_id = sp.id
    WHERE ss.profile_id = public.current_user_id()
      AND ss.status IN ('active', 'trialing')
      AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      AND sp.category = p_category
  );
$$;

COMMENT ON FUNCTION public.has_plan_category(p_category plan_category) IS 'التحقق من فئة خطة المستخدم';

-- 1️⃣6️⃣ دالة: حالة الاشتراك
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM get_subscription_status()
-- 📊 ترجع حالة مفصلة للاشتراك

CREATE OR REPLACE FUNCTION public.get_subscription_status()
RETURNS TABLE (
  status sub_status,
  is_active boolean,
  is_expired boolean,
  is_trialing boolean,
  days_until_expiry integer,
  auto_renew boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    ss.status,
    (ss.status IN ('active', 'trialing') AND (ss.ends_at IS NULL OR ss.ends_at > NOW())) AS is_active,
    (ss.status = 'expired' OR ss.ends_at <= NOW()) AS is_expired,
    (ss.status = 'trialing') AS is_trialing,
    CASE
      WHEN ss.ends_at IS NOT NULL THEN
        EXTRACT(DAY FROM (ss.ends_at - NOW()))::integer
      ELSE NULL
    END AS days_until_expiry,
    ss.auto_renew
  FROM public.saas_subscription ss
  WHERE ss.profile_id = public.current_user_id()
  ORDER BY ss.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_subscription_status() IS 'إرجاع حالة اشتراك المستخدم مفصلة';

-- 1️⃣7️⃣ دالة: التحقق من ميزة في الخطة
-- =====================================================
-- 🎯 الاستخدام: has_plan_feature('unlimited_products')

CREATE OR REPLACE FUNCTION public.has_plan_feature(p_feature text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.saas_subscription ss
    JOIN public.saas_plan sp ON ss.plan_id = sp.id,
    LATERAL jsonb_array_elements_text(sp.features) AS feature
    WHERE ss.profile_id = public.current_user_id()
      AND ss.status IN ('active', 'trialing')
      AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      AND feature = p_feature
  );
$$;

COMMENT ON FUNCTION public.has_plan_feature(p_feature text) IS 'التحقق من وجود ميزة في خطة المستخدم';

-- 1️⃣8️⃣ دالة: تاريخ انتهاء الخطة
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_plan_expiry()
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT ss.ends_at
  FROM public.saas_subscription ss
  WHERE ss.profile_id = public.current_user_id()
    AND ss.status IN ('active', 'trialing')
  ORDER BY ss.created_at DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_plan_expiry() IS 'إرجاع تاريخ انتهاء خطة المستخدم';

-- =====================================================
-- 📌 القسم الخامس: دوال إدارية (للأدمن فقط)
-- =====================================================

-- 1️⃣9️⃣ دالة: جميع الاشتراكات النشطة (للأدمن)
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM admin_get_all_subscriptions()
-- 🔒 يجب التحقق من is_admin() قبل الاستخدام في التطبيق

CREATE OR REPLACE FUNCTION public.admin_get_all_subscriptions()
RETURNS TABLE (
  subscription_id uuid,
  user_email text,
  user_name text,
  plan_name text,
  plan_category plan_category,
  status sub_status,
  price numeric(10,2),
  starts_at timestamptz,
  ends_at timestamptz,
  auto_renew boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    ss.id,
    cp.email,
    cp.full_name,
    sp.name_ar,
    sp.category,
    ss.status,
    sp.price,
    ss.starts_at,
    ss.ends_at,
    ss.auto_renew
  FROM public.saas_subscription ss
  JOIN public.saas_plan sp ON ss.plan_id = sp.id
  JOIN public.core_profile cp ON ss.profile_id = cp.id
  WHERE ss.status IN ('active', 'trialing')
  ORDER BY ss.created_at DESC;
$$;

COMMENT ON FUNCTION public.admin_get_all_subscriptions() IS 'إرجاع جميع الاشتراكات النشطة (للأدمن فقط)';

-- 2️⃣0️⃣ دالة: إحصائيات الاشتراكات (للأدمن)
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_get_subscription_stats()
RETURNS TABLE (
  category plan_category,
  total_subscriptions bigint,
  active_subscriptions bigint,
  expired_subscriptions bigint,
  total_revenue numeric(15,2)
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    sp.category,
    COUNT(*) AS total_subscriptions,
    COUNT(*) FILTER (WHERE ss.status = 'active') AS active_subscriptions,
    COUNT(*) FILTER (WHERE ss.status = 'expired') AS expired_subscriptions,
    SUM(sp.price) FILTER (WHERE ss.status = 'active') AS total_revenue
  FROM public.saas_subscription ss
  JOIN public.saas_plan sp ON ss.plan_id = sp.id
  GROUP BY sp.category
  ORDER BY sp.category;
$$;

COMMENT ON FUNCTION public.admin_get_subscription_stats() IS 'إحصائيات الاشتراكات حسب الفئة (للأدمن فقط)';

-- =====================================================
-- ✅ END OF UTILITY FUNCTIONS
-- =====================================================

/*
📋 ملخص الدوال:

🔐 دوال التحقق من الهوية (6 دوال):
  1. current_user_id()           ← معرف المستخدم
  2. has_role(role)              ← التحقق من دور
  3. is_admin()                  ← هل هو مدير؟
  4. is_vendor()                 ← هل هو بائع؟
  5. is_delivery()               ← هل هو سائق؟
  6. get_user_roles()            ← جميع الأدوار

🎯 دوال الصلاحيات (2 دوال):
  7. has_permission(perm)        ← التحقق من صلاحية
  8. get_user_permissions()      ← جميع الصلاحيات

🏪 دوال المتاجر والمنتجات (3 دوال):
  9. get_vendor_id()             ← معرف المتجر
  10. is_store_owner(vendor_id)  ← ملكية المتجر
  11. is_product_owner(prod_id)  ← ملكية المنتج

📦 دوال الاشتراكات (7 دوال):
  12. get_user_plan()            ← تفاصيل الخطة
  13. has_plan_permission(perm)  ← صلاحية الخطة
  14. get_plan_permissions()     ← صلاحيات الخطة
  15. has_plan_category(cat)     ← فئة الخطة
  16. get_subscription_status()  ← حالة الاشتراك
  17. has_plan_feature(feat)     ← ميزة في الخطة
  18. get_plan_expiry()          ← تاريخ الانتهاء

👑 دوال إدارية (2 دوال):
  19. admin_get_all_subscriptions()  ← جميع الاشتراكات
  20. admin_get_subscription_stats() ← إحصائيات

📊 الإجمالي: 20 دالة

⚡ التحسينات:
  ✅ استخدام ? بدلاً من @> للتحقق من JSONB (أسرع)
  ✅ إضافة PARALLEL SAFE للأداء الأفضل
  ✅ تسمية موحدة (current_user_id بدلاً من get_current_user_id)
  ✅ إزالة الدوال المكررة
  ✅ استخدام EXISTS بدلاً من JOIN كامل
  ✅ توثيق شامل لكل دالة
*/
