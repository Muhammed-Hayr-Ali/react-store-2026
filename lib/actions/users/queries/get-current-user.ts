/**
 * @file lib/actions/users/queries/get-current-user.ts
 * @description Retrieves the current user's profile, role, and permissions.
 */

"use server"

import { cache } from "react"
import { z } from "zod"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

const currentUserSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  gender: z.enum(["male", "female", "other"]).nullable(),
  status: z.string().nullable(),
  email_verified: z.boolean(),
  phone_verified: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  role: z.string(),
  permissions: z.array(z.string()),
})

export type CurrentUser = z.infer<typeof currentUserSchema>

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

      const currentUser = currentUserSchema.safeParse(data)
      if (!currentUser.success) {
        return {
          success: false,
          error: "GET_CURRENT_USER_ERROR",
          details: {
            database: ["The current-user function returned invalid data."],
          },
        }
      }

      return { success: true, data: currentUser.data }
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
