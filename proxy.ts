// proxy.ts
import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing" // استخدام alias موحد للمسار
import { createMiddlewareSupabaseClient } from "./lib/middleware/supabase"
import { handleBanCheck } from "./lib/middleware/ban-guard"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // 1. تشغيل وسيط التدويل أولاً لالتقاط مسار اللغة الجديد أو أي Redirect
  const response = intlMiddleware(request)

  // 2. تحديث جلسة Supabase مع تمرير نفس كائن الاستجابة لمزامنة الكوكيز
  const {
    supabase,
    user,
    response: supabaseResponse,
  } = await createMiddlewareSupabaseClient(request)

  // 3. التحقق من حالة الحظر (Ban Guard)
  const banRedirect = await handleBanCheck({
    request,
    supabase,
    user,
    response: supabaseResponse,
  })

  if (banRedirect) {
    return banRedirect
  }

  // 4. نسخ كوكيز جلسة Supabase إلى استجابة next-intl النهائية بأمان
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })

  return response
}

export const config = {
  // مطابقة كافة المسارات باستثناء ملفات النظام والـ API
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
