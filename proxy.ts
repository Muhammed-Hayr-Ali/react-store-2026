// proxy.ts
import { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing" 
import { createMiddlewareSupabaseClient } from "./lib/middleware/supabase"
import { handleBanCheck } from "./lib/middleware/ban-guard"

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {

  const response = intlMiddleware(request)


  const {
    supabase,
    user,
    response: supabaseResponse,
  } = await createMiddlewareSupabaseClient(request)


  const banRedirect = await handleBanCheck({
    request,
    supabase,
    user,
    response: supabaseResponse,
  })

  if (banRedirect) {
    return banRedirect
  }


  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })

  return response
}

export const config = {

  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
