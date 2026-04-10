-- =====================================================
-- 🔧 Utility Functions - الدوال المساعدة الموحدة
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف ثانياً
--    بعد: 001_Schema/001_schema.sql
--    قبل: 003_RLS Policies/000_rls_policies.sql
-- =====================================================
-- 📋 هذا الملف يحتوي على الدوال المساعدة المستخدمة في:
--    - سياسات RLS (Row Level Security)
--    - التحقق من الصلاحيات
--    - إدارة المتجر والمنتجات
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

-- 4️⃣ دالة: التحقق من دور البائع/الموظف
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

COMMENT ON FUNCTION public.is_vendor() IS 'التحقق مما إذا كان المستخدم بائعاً/موظفاً';

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
-- 📌 القسم الثالث: دوال إدارة المتجر والمنتجات
-- =====================================================

-- 9️⃣ دالة: التحقق من ملكية المنتج
-- =====================================================
-- 🎯 الاستخدام: is_product_owner('product-uuid')
-- 📝 ملاحظة: تستخدم user_id بدلاً من vendor_id

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
    WHERE sp.id = p_product_id
      AND sp.user_id = public.current_user_id()
  );
$$;

COMMENT ON FUNCTION public.is_product_owner(p_product_id uuid) IS 'التحقق من ملكية منتج معين';

-- � دالة: الحصول على إعدادات المتجر
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM get_store_settings()
-- 📊 ترجع إعدادات المتجر الوحيد

CREATE OR REPLACE FUNCTION public.get_store_settings()
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  email text,
  phone text,
  address text,
  city text,
  default_currency varchar(3),
  logo_url text,
  banner_url text,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT ss.id, ss.name_ar, ss.name_en, ss.description_ar, ss.description_en,
         ss.email, ss.phone, ss.address, ss.city, ss.default_currency,
         ss.logo_url, ss.banner_url, ss.is_active
  FROM public.store_settings ss
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_store_settings() IS 'إرجاع إعدادات المتجر الوحيد';

-- =====================================================
-- 📌 القسم الرابع: دوال إدارة التوصيل والتسليم
-- =====================================================

-- 1️⃣1️⃣ دالة: إنشاء رمز التحقق من التسليم (QR Code)
-- =====================================================
-- 🎯 الاستخدام: create_delivery_verification('order-uuid')
-- 📝 ملاحظة: ينشئ سجل تسليم جديد مع رمز فريد

CREATE OR REPLACE FUNCTION public.create_delivery_verification(p_order_id uuid)
RETURNS varchar(64)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code varchar(64);
BEGIN
  -- Generate unique verification code
  v_code := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO public.trade_order_delivery (
    order_id,
    verification_code,
    delivery_status,
    created_at,
    updated_at
  ) VALUES (
    p_order_id,
    v_code,
    'pending',
    now(),
    now()
  );
  
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.create_delivery_verification(p_order_id uuid) IS 'إنشاء رمز التحقق من التسليم لطلب معين';

-- 1️⃣2️⃣ دالة: التحقق من تسليم الطلب
-- =====================================================
-- 🎯 الاستخدام: verify_delivery('verification-code')
-- � ملاحظة: يحدث حالة الطلب والتسليم

CREATE OR REPLACE FUNCTION public.verify_delivery(p_verification_code varchar(64))
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id uuid;
  v_order_id uuid;
BEGIN
  -- Find delivery record
  SELECT tod.id, tod.order_id
  INTO v_delivery_id, v_order_id
  FROM public.trade_order_delivery tod
  WHERE tod.verification_code = p_verification_code
    AND tod.delivery_status = 'pending'
  LIMIT 1;
  
  IF v_delivery_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update delivery record
  UPDATE public.trade_order_delivery
  SET
    delivery_status = 'delivered',
    delivered_at = now(),
    delivered_by = public.current_user_id(),
    customer_verified = true,
    updated_at = now()
  WHERE id = v_delivery_id;
  
  -- Update order status
  UPDATE public.trade_order
  SET
    status = 'delivered',
    updated_at = now()
  WHERE id = v_order_id;
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.verify_delivery(p_verification_code varchar(64)) IS 'التحقق من تسليم الطلب وتحديث الحالة';

-- =====================================================
-- 📌 القسم الخامس: دوال إدارية (للأدمن فقط)
-- =====================================================

-- 1️⃣3️⃣ دالة: إحصائيات الطلبات (للأدمن)
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_get_order_stats()
RETURNS TABLE (
  status order_status,
  total_orders bigint,
  total_revenue numeric(15,2)
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    status,
    COUNT(*) AS total_orders,
    SUM(grand_total) AS total_revenue
  FROM public.trade_order
  GROUP BY status
  ORDER BY total_orders DESC;
$$;

COMMENT ON FUNCTION public.admin_get_order_stats() IS 'إحصائيات الطلبات حسب الحالة (للأدمن فقط)';

-- 1️⃣4️⃣ دالة: جميع الطلبات (للأدمن)
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS TABLE (
  order_id uuid,
  order_number text,
  customer_email text,
  customer_name text,
  status order_status,
  grand_total numeric(10,2),
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
PARALLEL SAFE
AS $$
  SELECT
    ord.id,
    ord.order_number,
    cp.email,
    cp.full_name,
    ord.status,
    ord.grand_total,
    ord.created_at
  FROM public.trade_order ord
  JOIN public.core_profile cp ON ord.customer_id = cp.id
  ORDER BY ord.created_at DESC;
$$;

COMMENT ON FUNCTION public.admin_get_all_orders() IS 'إرجاع جميع الطلبات (للأدمن فقط)';

-- =====================================================
-- ✅ END OF UTILITY FUNCTIONS
-- =====================================================

/*
📋 ملخص الدوال:

🔐 دوال التحقق من الهوية (6 دوال):
  1. current_user_id()           ← معرف المستخدم
  2. has_role(role)              ← التحقق من دور
  3. is_admin()                  ← هل هو مدير؟
  4. is_vendor()                 ← هل هو بائع/موظف؟
  5. is_delivery()               ← هل هو سائق؟
  6. get_user_roles()            ← جميع الأدوار

🎯 دوال الصلاحيات (2 دوال):
  7. has_permission(perm)        ← التحقق من صلاحية
  8. get_user_permissions()      ← جميع الصلاحيات

🏪 دوال المتجر والمنتجات (3 دوال):
  9. is_product_owner(prod_id)   ← ملكية المنتج
  10. get_store_settings()       ← إعدادات المتجر

� دوال التوصيل والتسليم (2 دوال):
  11. create_delivery_verification(order_id)  ← إنشاء رمز QR
  12. verify_delivery(code)                   ← التحقق من التسليم

👑 دوال إدارية (2 دوال):
  13. admin_get_order_stats()    ← إحصائيات الطلبات
  14. admin_get_all_orders()     ← جميع الطلبات

📊 الإجمالي: 14 دالة

⚡ التحسينات:
  ✅ استخدام ? بدلاً من @> للتحقق من JSONB (أسرع)
  ✅ إضافة PARALLEL SAFE للأداء الأفضل
  ✅ تسمية موحدة (current_user_id بدلاً من get_current_user_id)
  ✅ إزالة دوال SaaS والاشتراكات (لم تعد موجودة)
  ✅ إزالة دوال vendor_id (استبدالها بـ user_id)
  ✅ إضافة دوال جديدة للتسليم عبر QR Code
  ✅ توثيق شامل لكل دالة
*/
