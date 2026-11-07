/**
 * @file lib/actions/users/queries/get-current-user.ts
 * @description Retrieves the current user's profile, role, and permissions.
 */

"use server"

import { cache } from "react"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
// ,"email_verified":false,"phone_verified":null}
export type CurrentUser = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  gender: "male" | "female" | "other" | null
  status: string | null
  email_verified: boolean
  phone_verified: boolean
  created_at: string | null
  updated_at: string | null
  role: string
  permissions: string[]
}

/** ترجع ملف المستخدم الحالي وصلاحياته مرة واحدة ضمن الطلب نفسه. */
export const getCurrentUser = cache(
  async (): Promise<ApiResult<CurrentUser | null>> => {
    try {
      const supabase = await createServerClient()

      const { data, error } = await supabase.rpc("get_current_user")

      if (!data || error) {
        return {
          success: false,
          error: "GET_CURRENT_USER_ERROR",
          details: { database: [error?.message ?? "Unknown database error"] },
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
