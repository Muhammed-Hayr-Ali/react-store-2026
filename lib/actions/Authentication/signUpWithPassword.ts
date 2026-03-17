import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { SignUpInput } from "@/lib/types/auth"
import { ApiResult } from "@/lib/types/common"

// ===============================================================================
// Sign Up With Password & Generate Welcome Discount Code & Send Welcome Email
// ===============================================================================
export async function signUpWithPassword({
  first_name,
  last_name,
  email,
  password,
}: SignUpInput): Promise<ApiResult> {

  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  })

  if (error) {
    console.error("Error signing up:", error)
    return {
      success: false,
      error: "USER_SIGNUP_ERROR",
    }
  }

  return {
    success: true,
  }
}
