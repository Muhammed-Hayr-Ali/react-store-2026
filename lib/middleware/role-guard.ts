/**
 * @file lib/middleware/role-guard.ts
 * @description Evaluates route accessibility based on authentication status and user roles using a declarative rule map.
 */

import { NextResponse, type NextRequest } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { ROLES, type AppRole } from "@/lib/actions/role/types"
import { appRoutes } from "../config/app-routes"

// ============================================================================
// 1. تعريف قواعد المسارات المحمية
// ============================================================================

interface RouteRule {
  /** بادئة المسار المراد حمايته */
  prefix: string
  /** الأدوار المسموح لها بالدخول */
  allowedRoles: AppRole[]
  /** الوجهة التي يتم تحويل المستخدم إليها عند انعدام الصلاحية */
  fallbackPath: string
}

/**
 * مصفوفة القواعد:
 * يجب ترتيب المسارات من الأكثر تحديداً وعمقاً إلى الأقل تحديداً
 */
const PROTECTED_ROUTE_RULES: RouteRule[] = [
  // إدارة الأدوار والصلاحيات: للأدمن فقط
  {
    prefix: "/dashboard/roles",
    allowedRoles: [ROLES.ADMIN],
    fallbackPath: "/dashboard",
  },
  // إدارة البلاغات والرقابة: للأدمن والمشرفين
  {
    prefix: "/dashboard/reports",
    allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
    fallbackPath: "/dashboard",
  },
  // القاعدة العامة للوحة التحكم: للأدمن والمشرفين (تمنع العملاء والزوار)
  {
    prefix: "/dashboard",
    allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
    fallbackPath: "/",
  },
]

// مسارات المصادقة العامة (تمنع المسجلين بالفعل)
const AUTH_ROUTE_PREFIXES = ["/login", "/register", "/forgot-password"]

// ============================================================================
// 2. الدالة الرئيسية لفحص وتوجيه المسار
// ============================================================================

interface HandleRouteAccessParams {
  request: NextRequest
  supabase: SupabaseClient
  user: User | null
  response: NextResponse
}

export async function handleRouteAccess({
  request,
  supabase,
  user,
  response,
}: HandleRouteAccessParams): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  // 1. استخراج بادئة اللغة والمسار المجرد (يدعم اللغات ذات الحرفين مثل ar, en)
  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments.length > 0 && segments[0].length === 2
  const currentLocale = hasLocale ? segments[0] : "en"
  const normalizedPath = hasLocale
    ? `/${segments.slice(1).join("/")}`
    : pathname

  // دالة مساعدة لإنشاء التوجيه مع الحفاظ على كوكيز الجلسة
  const createRedirectResponse = (
    targetPath: string,
    searchParams?: Record<string, string>
  ) => {
    const url = request.nextUrl.clone()
    url.pathname = `/${currentLocale}${targetPath === "/" ? "" : targetPath}`
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) =>
        url.searchParams.set(key, value)
      )
    }
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // 2. إذا كان المستخدم مسجل دخول وحاول زيارة صفحات تسجيل الدخول/التسجيل
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
    normalizedPath.startsWith(prefix)
  )
  if (isAuthRoute && user) {
    return createRedirectResponse("/")
  }

  // 3. مطابقة المسار مع القواعد المحمية
  const matchedRule = PROTECTED_ROUTE_RULES.find((rule) =>
    normalizedPath.startsWith(rule.prefix)
  )

  if (matchedRule) {
    // توجيه غير المسجلين لصفحة الدخول مع حفظ مسار العودة
    if (!user) {
      return createRedirectResponse(appRoutes.auth.login, { redirect: pathname })
    }

    // جلب أدوار المستخدم بأمان مع معالجة الأخطاء
    let userRolesList: AppRole[] = []
    try {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id)

      if (!error && userRoles) {
        userRolesList = userRoles
          .map((r) => (r.roles as unknown as { name: AppRole })?.name)
          .filter(Boolean)
      }
    } catch {
      // في حال حدوث خطأ في الاتصال، يتم تطبيق وجهة الأمان
      return createRedirectResponse(matchedRule.fallbackPath)
    }

    // التحقق من توافر أحد الأدوار المسموحة في القاعدة
    const hasAllowedRole = matchedRule.allowedRoles.some((role) =>
      userRolesList.includes(role)
    )

    if (!hasAllowedRole) {
      return createRedirectResponse(matchedRule.fallbackPath)
    }
  }

  return null
}
