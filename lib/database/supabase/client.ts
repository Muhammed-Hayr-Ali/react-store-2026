import { createBrowserClient as supabaseCreateBrowserClient } from "@supabase/ssr"
import { SUPABASE_COOKIE_OPTIONS } from "./cookie-options"
import type { Database } from "./types"

export function createBrowserClient() {
  return supabaseCreateBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SUPABASE_COOKIE_OPTIONS,
      isSingleton: true,
    }
  )
}

// Alias for backward compatibility
export { createBrowserClient as createClient }
