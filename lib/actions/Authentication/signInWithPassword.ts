import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { SignInInput } from "@/lib/types/auth"
import { ApiResult } from "@/lib/types/common"

export async function signInWithPassword({
  email,
  password,
}: SignInInput): Promise<ApiResult> {
    
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Error signing in:", error)
    return {
      success: false,
      error: "USER_SIGNIN_ERROR",
    }
  }

  return { success: true }
}
