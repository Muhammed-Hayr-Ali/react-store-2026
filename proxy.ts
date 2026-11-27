// proxy.ts
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing" // استخدام alias موحد للمسار
import { createMiddlewareSupabaseClient } from "./lib/middleware/supabase"
import { handleBanCheck } from "./lib/middleware/ban-guard"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // Refresh Supabase cookies before next-intl forwards the request downstream.
  const {
    supabase,
    user,
    response,
  } = await createMiddlewareSupabaseClient(request)

  const banRedirect = await handleBanCheck({
    request,
    supabase,
    user,
    response,
  })

  if (banRedirect) {
    return banRedirect
  }

  const intlResponse = intlMiddleware(request)

  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie)
  })
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header)
    if (value) intlResponse.headers.set(header, value)
  }

  return intlResponse
}

export const config = {
  // مطابقة كافة المسارات باستثناء ملفات النظام والـ API
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
