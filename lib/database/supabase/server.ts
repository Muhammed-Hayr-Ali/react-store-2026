import { createServerClient as supabaseCreateServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_COOKIE_OPTIONS } from "./cookie-options"
import { Database } from "./database.types"

export async function createServerClient() {
  const cookieStore = await cookies()

  return supabaseCreateServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("Cookies can only be modified")
            ) {
              return
            }

            console.error("Failed to persist Supabase auth cookies:", error)
            throw error
          }
        },
      },
    }
  )
}

// Alias for backward compatibility
export { createServerClient as createClient }

