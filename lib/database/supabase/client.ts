import { createBrowserClient as supabaseCreateBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  return supabaseCreateBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") {
            return []
          }
          const cookies = document.cookie.split(";").map((cookie) => {
            const [name, value] = cookie.trim().split("=")
            return { name, value }
          })
          return cookies
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") {
            return
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = `${name}=${value}`
            if (options?.maxAge) {
              document.cookie = `${cookieString}; max-age=${options.maxAge}; path=/`
            } else {
              document.cookie = `${cookieString}; path=/`
            }
          })
        },
      },
    }
  )
}

// Alias for backward compatibility
export { createBrowserClient as createClient }
