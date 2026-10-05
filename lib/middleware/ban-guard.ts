/**
 * @file lib/middleware/ban-guard.ts
 * @description Evaluates account ban status and redirects banned users to the dedicated ban screen.
 */

import { NextResponse, type NextRequest } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { appRoutes } from "../config/app-routes"

interface HandleBanCheckParams {
  request: NextRequest
  supabase: SupabaseClient
  user: User | null
  response: NextResponse
}

const AUTH_ROUTE_PREFIXES = [
  appRoutes.auth.login,
  appRoutes.auth.signup,
  appRoutes.auth.forgotPassword,
  appRoutes.auth.resetPassword,
]

export async function handleBanCheck({
  request,
  supabase,
  user,
  response,
}: HandleBanCheckParams): Promise<NextResponse | null> {
  if (!user) return null

  const { pathname } = request.nextUrl

  // استخراج بادئة اللغة والمسار المجرد
  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments.length > 0 && segments[0].length === 2
  const currentLocale = hasLocale ? segments[0] : "en"
  const normalizedPath = hasLocale
    ? `/${segments.slice(1).join("/")}`
    : pathname

  const isBannedRoute = normalizedPath.startsWith("/banned")
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((prefix) =>
    normalizedPath.startsWith(prefix)
  )

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single()

    const isBanned = profile?.status === "banned"

    // دالة مساعدة للتوجيه مع الاحتفاظ بكوكيز الجلسة
    const createRedirect = (targetPath: string) => {
      const url = request.nextUrl.clone()
      url.pathname = `/${currentLocale}${targetPath === "/" ? "" : targetPath}`
      const redirectResponse = NextResponse.redirect(url)
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // 1. إذا كان المستخدم محظوراً ويحاول تصفح الموقع (باستثناء /banned ومسارات auth لتسجيل الخروج)
    if (isBanned && !isBannedRoute && !isAuthRoute) {
      return createRedirect("/banned")
    }

    // 2. إذا لم يكن محظوراً وحاول فتح /banned يدوياً
    if (!isBanned && isBannedRoute) {
      return createRedirect(appRoutes.home)
    }
  } catch {
    // في حال حدوث أي خطأ عارض نتابع الطلب بأمان
  }

  return null
}
