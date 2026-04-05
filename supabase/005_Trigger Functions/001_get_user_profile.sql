-- =====================================================
-- 👤 Get User Full Profile - جلب بيانات المستخدم الكاملة
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف بعد 000_trigger_functions.sql
-- =====================================================
-- 📋 تُرجع بيانات المستخدم كاملة لاستخدامها في Auth Provider:
--    - البروفايل الشخصي
--    - الأدوار مع صلاحيات كل دور
--    - الاشتراكات النشطة مع صلاحيات كل خطة
-- =====================================================

-- 1️⃣ دالة: جلب بيانات المستخدم الكاملة (JSON)
-- =====================================================
-- 🎯 الاستخدام: SELECT public.get_user_full_profile();
-- 📊 تُرجع JSON يحتوي على كل تفاصيل المستخدم

CREATE OR REPLACE FUNCTION public.get_user_full_profile()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'id', cp.id,
        'email', cp.email,
        'first_name', cp.first_name,
        'last_name', cp.last_name,
        'full_name', cp.full_name,
        'avatar_url', cp.avatar_url,
        'phone_number', cp.phone_number,
        'is_phone_verified', cp.is_phone_verified,
        'preferred_language', cp.preferred_language,
        'timezone', cp.timezone,
        'created_at', cp.created_at
      )
      FROM public.core_profile cp
      WHERE cp.id = auth.uid()
    ),
    'roles', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'code', cr.code,
            'description', cr.description,
            'permissions', cr.permissions
          )
        ),
        '[]'::jsonb
      )
      FROM public.core_profile_role cpr
      JOIN public.core_role cr ON cpr.role_id = cr.id
      WHERE cpr.profile_id = auth.uid()
    ),
    'subscriptions', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'plan_id', sp.id,
            'category', sp.category,
            'name_ar', sp.name_ar,
            'name_en', sp.name_en,
            'price', sp.price,
            'currency', sp.currency,
            'billing_cycle', sp.billing_cycle,
            'permissions', sp.permissions,
            'features', sp.features,
            'status', ss.status,
            'starts_at', ss.starts_at,
            'ends_at', ss.ends_at,
            'auto_renew', ss.auto_renew
          )
        ),
        '[]'::jsonb
      )
      FROM public.saas_subscription ss
      JOIN public.saas_plan sp ON ss.plan_id = sp.id
      WHERE ss.profile_id = auth.uid()
        AND ss.status IN ('active', 'trialing')
        AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
    ),
    'permissions', (
      SELECT COALESCE(
        (
          SELECT jsonb_agg(DISTINCT perm)
          FROM public.core_profile_role cpr
          JOIN public.core_role cr ON cpr.role_id = cr.id,
          LATERAL jsonb_array_elements_text(cr.permissions) AS perm
          WHERE cpr.profile_id = auth.uid()
        ),
        '[]'::jsonb
      )
    )
  );
$$;

COMMENT ON FUNCTION public.get_user_full_profile() IS 'جلب بيانات المستخدم الكاملة (بروفايل، أدوار، اشتراكات، صلاحيات)';

-- 2️⃣ دالة: جلب البروفايل مع الأدوار (جدول)
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM public.get_user_profile_with_roles();

CREATE OR REPLACE FUNCTION public.get_user_profile_with_roles()
RETURNS TABLE (
  profile_id uuid,
  email text,
  full_name text,
  avatar_url text,
  role_code role_name,
  role_description text,
  role_permissions jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    cp.id AS profile_id,
    cp.email,
    cp.full_name,
    cp.avatar_url,
    cr.code AS role_code,
    cr.description AS role_description,
    cr.permissions AS role_permissions
  FROM public.core_profile cp
  LEFT JOIN public.core_profile_role cpr ON cp.id = cpr.profile_id
  LEFT JOIN public.core_role cr ON cpr.role_id = cr.id
  WHERE cp.id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_user_profile_with_roles() IS 'جلب البروفايل مع الأدوار والصلاحيات';

-- 3️⃣ دالة: جلب الاشتراكات النشطة مع تفاصيل الخطط
-- =====================================================
-- 🎯 الاستخدام: SELECT * FROM public.get_user_active_subscriptions();

CREATE OR REPLACE FUNCTION public.get_user_active_subscriptions()
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  category plan_category,
  plan_name_ar text,
  plan_name_en text,
  price numeric(10,2),
  currency varchar(3),
  billing_cycle text,
  status sub_status,
  starts_at timestamptz,
  ends_at timestamptz,
  auto_renew boolean,
  plan_permissions jsonb,
  plan_features jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    ss.id AS subscription_id,
    sp.id AS plan_id,
    sp.category,
    sp.name_ar AS plan_name_ar,
    sp.name_en AS plan_name_en,
    sp.price,
    sp.currency,
    sp.billing_cycle,
    ss.status,
    ss.starts_at,
    ss.ends_at,
    ss.auto_renew,
    sp.permissions AS plan_permissions,
    sp.features AS plan_features
  FROM public.saas_subscription ss
  JOIN public.saas_plan sp ON ss.plan_id = sp.id
  WHERE ss.profile_id = auth.uid()
    AND ss.status IN ('active', 'trialing')
    AND (ss.ends_at IS NULL OR ss.ends_at > NOW());
$$;

COMMENT ON FUNCTION public.get_user_active_subscriptions() IS 'جلب الاشتراكات النشطة مع تفاصيل الخطط';

-- 4️⃣ دالة: التحقق من صلاحية معينة (دور + خطة)
-- =====================================================
-- 🎯 الاستخدام: SELECT public.has_any_permission('products:create');

CREATE OR REPLACE FUNCTION public.has_any_permission(p_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- صلاحية من الأدوار
    SELECT 1
    FROM public.core_profile_role cpr
    JOIN public.core_role cr ON cpr.role_id = cr.id
    WHERE cpr.profile_id = auth.uid()
      AND (cr.permissions ? p_permission OR cr.permissions ? '*:*')

    UNION ALL

    -- صلاحية من الخطة النشطة
    SELECT 1
    FROM public.saas_subscription ss
    JOIN public.saas_plan sp ON ss.plan_id = sp.id
    WHERE ss.profile_id = auth.uid()
      AND ss.status IN ('active', 'trialing')
      AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      AND (sp.permissions ? p_permission OR sp.permissions ? '*:*')
  )
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.has_any_permission(p_permission text) IS 'التحقق من صلاحية (من الأدوار أو الخطة النشطة)';

-- 5️⃣ دالة: جميع الصلاحيات (أدوار + خطط)
-- =====================================================
-- 🎯 الاستخدام: SELECT public.get_all_permissions();

CREATE OR REPLACE FUNCTION public.get_all_permissions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (
      -- صلاحيات من الأدوار
      SELECT jsonb_agg(DISTINCT perm)
      FROM (
        SELECT jsonb_array_elements_text(cr.permissions) AS perm
        FROM public.core_profile_role cpr
        JOIN public.core_role cr ON cpr.role_id = cr.id
        WHERE cpr.profile_id = auth.uid()

        UNION

        -- صلاحيات من الخطة النشطة
        SELECT jsonb_array_elements_text(sp.permissions) AS perm
        FROM public.saas_subscription ss
        JOIN public.saas_plan sp ON ss.plan_id = sp.id
        WHERE ss.profile_id = auth.uid()
          AND ss.status IN ('active', 'trialing')
          AND (ss.ends_at IS NULL OR ss.ends_at > NOW())
      ) AS all_perms
    ),
    '[]'::jsonb
  );
$$;

COMMENT ON FUNCTION public.get_all_permissions() IS 'جميع صلاحيات المستخدم (أدوار + خطط نشطة)';

-- =====================================================
-- ✅ END OF USER PROFILE FUNCTIONS
-- =====================================================

/*
📋 ملخص الدوال:

👤 دوال البروفايل (2 دالة):
  1. get_user_full_profile()              ← JSON كامل (بروفايل + أدوار + اشتراكات + صلاحيات)
  2. get_user_profile_with_roles()        ← جدول (بروفايل + أدوار)

📦 دوال الاشتراكات (1 دالة):
  3. get_user_active_subscriptions()      ← جدول (اشتراكات نشطة + خطط)

🎯 دوال الصلاحيات (2 دالة):
  4. has_any_permission(perm)             ← boolean (من أدوار أو خطط)
  5. get_all_permissions()                ← jsonb (جميع الصلاحيات)

📊 الإجمالي: 5 دوال

💡 مثال الاستخدام في Next.js:
  // جلب البيانات كاملة لـ Auth Provider
  const { data } = await supabase.rpc('get_user_full_profile');
  // النتيجة:
  // {
  //   profile: { id, email, full_name, avatar_url, ... },
  //   roles: [{ code: 'customer', permissions: [...] }],
  //   subscriptions: [{ plan_name_ar, permissions: [...] }],
  //   permissions: ['products:read', 'orders:create', ...]
  // }
*/
