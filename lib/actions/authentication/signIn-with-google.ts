"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { OAuthSignInResult } from "./types"

export async function signInWithGoogle(): Promise<
  ApiResult<OAuthSignInResult>
> {
  const supabase = await createServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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

  if (error || !data?.url) {
    console.error("Supabase Google Sign-In Error:", error?.message)
    return {
      success: false,
      error: error?.message || "Failed to create sign-in URL",
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("login_method", "google", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return {
    success: true,
    data: { url: data.url },
  }
}
