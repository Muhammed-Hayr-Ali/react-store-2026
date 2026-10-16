/**
 * @file lib/actions/authentication/mutations/sign-in-with-google.ts
 * @description Initiates Google OAuth authentication flow.
 */

"use server"

import { cookies } from "next/headers"

import { createServerClient } from "@/lib/database/supabase/server"

import type { ApiResult, OAuthSignInResult } from "../types"

/**
 * تبدأ تسجيل الدخول عبر Google OAuth.
 */
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
    return {
      success: false,
      error: "SIGN_IN_GOOGLE_ERROR",
      details: error ? { oauth: [error.message] } : undefined,
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
