/**
 * @file lib/middleware/role-guard.ts
 * @description Disabled role checking - allows any authenticated user access to dashboard.
 */

import { NextResponse, type NextRequest } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { appRoutes } from "../config/app-routes"

// مسارات المصادقة مشتقة مباشرة من appRoutes لضمان التطابق
const AUTH_ROUTE_PREFIXES = [
  appRoutes.auth.login,
  appRoutes.auth.signup,
  appRoutes.auth.forgotPassword,
  appRoutes.auth.resetPassword,
]

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

  // 1. استخراج بادئة اللغة والمسار المجرد
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

  // 2. إذا كان المستخدم مسجل دخول وحاول زيارة صفحات الدخول/التسجيل
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
    normalizedPath.startsWith(prefix)
  )
  if (isAuthRoute && user) {
    return createRedirectResponse(appRoutes.home)
  }

  // 3. تم إيقاف فحص الأدوار (Role Guard) بناءً على طلبك،
  // مع الاكتفاء بطلب تسجيل الدخول فقط للمسارات التي تبدأ بـ /dashboard إذا أردت:
  const isDashboardRoute = normalizedPath.startsWith(appRoutes.dashboard.user.overview)
  if (isDashboardRoute && !user) {
    return createRedirectResponse(appRoutes.auth.login, {
      redirect: pathname,
    })
  }

  return null
}
