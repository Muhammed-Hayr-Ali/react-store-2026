"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import type { ApiResult, UUID } from "@/lib/database/types"

// =====================================================
// 🌐 Google Sign-In
// =====================================================

export async function signInWithGoogle(): Promise<ApiResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    return { success: false, error: "AUTH_GOOGLE_ERROR" }
  }

  if (!data.url) {
    return { success: false, error: "AUTH_GOOGLE_URL_ERROR" }
  }

  redirect(data.url)
}

// =====================================================
// 🔄 Google Callback Handler
// =====================================================

export async function handleGoogleCallback(): Promise<
  ApiResult<{ redirectPath: string }>
> {
  const supabase = await createClient()

  // 1. Verify session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "AUTH_GOOGLE_CALLBACK_ERROR" }
  }

  // 2. Verify or create profile
  const { data: profile } = await supabase
    .from("core_profile")
    .select("id, deleted_at")
    .eq("id", user.id as UUID)
    .single()

  // Profile not found — create new
  if (!profile) {
    const { error: insertError } = await supabase.from("core_profile").insert({
      id: user.id,
      email: user.email ?? "",
      first_name: user.user_metadata?.first_name ?? "",
      last_name: user.user_metadata?.last_name ?? "",
      avatar_url: user.user_metadata?.avatar_url ?? null,
      phone_number: null,
      is_phone_verified: false,
      preferred_language: "ar",
      timezone: "Asia/Riyadh",
    } as never)

    if (insertError) {
      const { data: retry } = await supabase
        .from("core_profile")
        .select("id")
        .eq("id", user.id as UUID)
        .single()

      if (!retry) {
        console.error(
          "Profile creation failed after Google sign-in:",
          insertError
        )
        return {
          success: false,
          error: "AUTH_GOOGLE_PROFILE_ERROR",
        }
      }
    }
  } else {
    // Profile exists — check not soft-deleted
    const p = profile as { deleted_at: string | null }
    if (p.deleted_at) {
      await supabase.auth.signOut()
      return { success: false, error: "AUTH_ACCOUNT_DELETED" }
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: { redirectPath: "/dashboard" } }
}

// =====================================================
// 🔗 Link Google Account
// =====================================================

export async function linkGoogleAccount(): Promise<ApiResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.url) {
    return { success: false, error: "AUTH_GOOGLE_LINK_ERROR" }
  }

  redirect(data.url)
}

// =====================================================
// 🗑️ Unlink Google Account
// =====================================================

export async function unlinkGoogleAccount(): Promise<ApiResult> {
  const supabase = await createClient()

  // Verify alternative sign-in exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "AUTH_UNAUTHENTICATED" }
  }

  const identities = user.identities ?? []
  const hasOtherProvider = identities.some((i) => i.provider !== "google")

  if (!hasOtherProvider) {
    return {
      success: false,
      error: "AUTH_GOOGLE_UNLINK_ONLY_ACCOUNT",
    }
  }

  const { error } = await supabase.auth.unlinkIdentity("google" as never)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/settings", "page")
  return { success: true }
}
