import { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { updateSession } from "./lib/database/supabase/middleware"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. تحديث جلسة Supabase وإعداد الكوكيز
  const supabaseResponse = await updateSession(request)

  // 2. تشغيل وسيط التوجيه للغات (next-intl)
  const intlResponse = intlMiddleware(request)

  // 3. نقل كوكيز الجلسة إلى استجابة التدويل لضمان استمرار تسجيل الدخول
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
