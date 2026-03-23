import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export async function signOut() {
    
  const supabase = createBrowserClient()
  const re = await supabase.auth.signOut()

  
  return re
}
