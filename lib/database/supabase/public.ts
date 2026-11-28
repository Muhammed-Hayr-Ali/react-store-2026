import { createClient } from "@supabase/supabase-js"
import { Database } from "./database.types"

export async function createPublicServerClient() {

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alias for backward compatibility
export { createPublicServerClient as createClient }
