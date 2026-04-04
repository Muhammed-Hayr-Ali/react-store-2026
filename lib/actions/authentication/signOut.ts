import { createBrowserClient } from "@/lib/database/supabase/client"

export async function signOut() {
    
  const supabase = createBrowserClient()
  const re = await supabase.auth.signOut()

  
  return re
}
