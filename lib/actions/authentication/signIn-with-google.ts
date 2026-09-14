"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { cookies } from "next/headers"

// 1. Change the return type to include the redirect URL
export async function signInWithGoogle(): Promise<ApiResult<{ url: string }>> {
  // initialize cookies
  const cookieStore = await cookies()
  // 1. Create a Supabase client
  const supabase = await createServerClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // 2. Extract both data and error
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  // 3. Check for an error or a missing URL
  if (error || !data?.url) {
    console.error("Supabase Google Sign-In Error:", error?.message)
    return {
      success: false,
      error: error?.message || "Failed to create sign-in URL",
    }
  }

  cookieStore.set("login_method", "google")

  return {
    success: true,
    data: { url: data.url },
  }
}
