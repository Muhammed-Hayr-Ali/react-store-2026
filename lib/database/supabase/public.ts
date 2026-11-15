import { createClient } from "@supabase/supabase-js"
 
export async function createPublicServerClient() {

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alias for backward compatibility
export { createPublicServerClient as createClient }
