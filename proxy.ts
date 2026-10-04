import { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { createMiddlewareSupabaseClient } from "./lib/middleware/supabase"
import { handleRouteAccess } from "./lib/middleware/role-guard"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. تحديث جلسة Supabase وجلب المستخدم
  const {
    supabase,
    user,
    response: supabaseResponse,
  } = await createMiddlewareSupabaseClient(request)

  // 2. التحقق من أذونات المسارات والأدوار
  const accessRedirect = await handleRouteAccess({
    request,
    supabase,
    user,
    response: supabaseResponse,
  })

  // إذا قرر فاحص الأدوار إعادة التوجيه (مثل الذهاب إلى /login) يتم التوجيه فوراً
  if (accessRedirect) {
    return accessRedirect
  }

  // 3. تشغيل وسيط التوجيه للغات (next-intl)
  const intlResponse = intlMiddleware(request)

  // 4. دمج كوكيز الجلسة مع استجابة التدويل
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
