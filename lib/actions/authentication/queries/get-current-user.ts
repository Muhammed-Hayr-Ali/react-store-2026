/**
 * @file lib/actions/authentication/queries/get-current-user.ts
 * @description Retrieves the currently authenticated user and profile information.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult, AuthenticatedUser } from "../types"

export async function getCurrentUser(): Promise<
  ApiResult<AuthenticatedUser | null>
> {
  try {
    // Step 1: Client Initialization
    const supabase = await createServerClient()

    // Step 2: Session User Lookup
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: true, data: null }
    }

    // Step 3: Profile Enrichment
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user.id)
      .single()

    const fullName = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ")
      : user.user_metadata?.name || null

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email ?? "",
        name: fullName || null,
        avatar_url:
          profile?.avatar_url || user.user_metadata?.avatar_url || null,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "GET_CURRENT_USER_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}