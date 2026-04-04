import { createBrowserClient } from "@supabase/ssr"
import { Database } from "../types"

export function createClient() {
  return createBrowserClient<Database>(
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

// import { createBrowserClient as supabaseCreateBrowserClient } from "@supabase/ssr";
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export function createBrowserClient() {
//   return supabaseCreateBrowserClient(supabaseUrl!, supabaseAnonKey!,
//     {
//       auth: {
//         flowType: 'pkce',
//         autoRefreshToken: true,
//         persistSession: true,
//         detectSessionInUrl: true,
//       },
//     });
// }
