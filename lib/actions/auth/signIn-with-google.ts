import { createClient } from "@/lib/database/supabase/client"
import { ApiResult } from "@/lib/database/types"
import { appRouter } from "@/lib/navigation"

export async function signInWithGoogle(): Promise<ApiResult> {
  const supabase = createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.error("Supabase Google Sign-In Error:", error.message)
    window.location.href = `${appRouter.callback}?error=${encodeURIComponent(error.message)}`
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}
