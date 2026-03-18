import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"

export async function signOut(): Promise<ApiResult> {
    
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    return { success: false, error: "USER_SIGNOUT_ERROR" }
  }
  return { success: true }
}
