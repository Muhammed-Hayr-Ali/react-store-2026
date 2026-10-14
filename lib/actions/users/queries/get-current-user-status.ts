/**
 * @file lib/actions/users/queries/get-current-user-status.ts
 * @description Retrieves the current user's authentication and account status.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createClient } from "@/lib/database/supabase/server"

import type { UserStatus } from "../types"

interface CurrentUserStatus {
  isAuthenticated: boolean
  status: UserStatus | null
  banReason: string | null
}

export async function getCurrentUserStatus(): Promise<
  ApiResult<CurrentUserStatus>
> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Error checking user authentication:", authError.message)
      return {
        success: false,
        error: "GET_CURRENT_USER_STATUS_ERROR",
        details: { auth: [authError.message] },
      }
    }

    if (!user) {
      return {
        success: true,
        data: { isAuthenticated: false, status: null, banReason: null },
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status, ban_reason")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching user status:", profileError.message)
      return {
        success: false,
        error: "GET_CURRENT_USER_STATUS_ERROR",
        details: { database: [profileError.message] },
      }
    }

    return {
      success: true,
      data: {
        isAuthenticated: true,
        status: (profile?.status as UserStatus) || "active",
        banReason: profile?.ban_reason || null,
      },
    }
  } catch (error) {
    console.error("Error checking user status:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}
