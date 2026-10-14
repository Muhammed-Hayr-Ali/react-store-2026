/**
 * @file lib/actions/users/queries/get-current-user.ts
 * @description Retrieves the current user's profile, role, and permissions.
 */

"use server"

import { cache } from "react"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

export type CurrentUser = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  profile_image: string | null
  gender: "male" | "female" | "other" | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  role: string
  permissions: string[]
}

export const getCurrentUser = cache(
  async (): Promise<ApiResult<CurrentUser | null>> => {
    try {
      const supabase = await createServerClient()

      const { data, error } = await supabase.rpc("get_current_user")

      if (error) {
        console.error("Error fetching current user:", error.message)
        return {
          success: false,
          error: "GET_CURRENT_USER_ERROR",
          details: { database: [error.message] },
        }
      }

      return {
        success: true,
        data: data ? (data as CurrentUser) : null,
      }
    } catch (error) {
      console.error("Unexpected error fetching current user:", error)
      return {
        success: false,
        error: "UNEXPECTED_ERROR",
        details: {
          system: [error instanceof Error ? error.message : "Unknown error"],
        },
      }
    }
  }
)
