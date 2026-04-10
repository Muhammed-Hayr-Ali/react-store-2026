-- =====================================================
-- 👤 Get User Full Profile - جلب بيانات المستخدم الكاملة
-- =====================================================
-- ⚠️ ترتيب التنفيذ: يجب تشغيل هذا الملف بعد 000_trigger_functions.sql
-- =====================================================
-- 📋 تُرجع بيانات المستخدم كاملة لاستخدامها في Auth Provider:
--    - البروفايل الشخصي
--    - الأدوار مع صلاحيات كل دور
--    - الصلاحيات المدمجة
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

COMMENT ON FUNCTION public.get_user_full_profile() IS 'جلب بيانات المستخدم الكاملة (بروفايل، أدوار، صلاحيات)';

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

-- =====================================================
-- ✅ END OF USER PROFILE FUNCTIONS
-- =====================================================

/*
📋 ملخص الدوال:

👤 دوال البروفايل (2 دالة):
  1. get_user_full_profile()              ← JSON كامل (بروفايل + أدوار + صلاحيات)
  2. get_user_profile_with_roles()        ← جدول (بروفايل + أدوار)

📊 الإجمالي: 2 دوال

💡 مثال الاستخدام في Next.js:
  // جلب البيانات كاملة لـ Auth Provider
  const { data } = await supabase.rpc('get_user_full_profile');
  // النتيجة:
  // {
  //   profile: { id, email, full_name, avatar_url, ... },
  //   roles: [{ code: 'customer', permissions: [...] }],
  //   permissions: ['products:read', 'orders:create', ...]
  // }
*/
