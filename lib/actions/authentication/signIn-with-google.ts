import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import { ApiResult } from "@/lib/types/common"
import { appRouter } from "@/lib/config/app_router"

export async function signInWithGoogle(): Promise<ApiResult> {
  const supabase = createBrowserClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/api/callback`,
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
