/**
 * @file lib/middleware/supabase.ts
 * @description Creates the Supabase SSR client for middleware with cookie sync.
 */

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/database/supabase/types"

export async function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          const nextResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.getAll().forEach((cookie) => {
            nextResponse.cookies.set(cookie)
          })
          for (const header of ["cache-control", "expires", "pragma"]) {
            const value = response.headers.get(header)
            if (value) nextResponse.headers.set(header, value)
          }
          response = nextResponse
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  if (error && error.name !== "AuthSessionMissingError") {
    console.error("Unable to refresh the Supabase auth session:", error)
  }

  return { supabase, user: data.user, response }
}
