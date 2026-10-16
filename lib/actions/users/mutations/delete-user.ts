/**
 * @file lib/actions/users/mutations/delete-user.ts
 * @description Deletes a user account and its profile.
 */

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import type { ApiResult } from "@/lib/actions/types/utils"
import { appRoutes } from "@/lib/config/app-routes"
import { createAdminClient } from "@/lib/database/supabase/admin"

import { hasPermission, PERMISSIONS } from "../../role"

interface DeleteUserInput {
  userId: string
}

/**
 * تحذف حساب المستخدم وملفه الشخصي.
 */
export async function deleteUser(
  input: DeleteUserInput
): Promise<ApiResult<null>> {
  const canDelete = await hasPermission(PERMISSIONS.DELETE_USER)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const idValidation = z.string().uuid().safeParse(input.userId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_USER_ID" }
  }

  try {
    const supabase = await createAdminClient()

    const { error: authError } = await supabase.auth.admin.deleteUser(
      input.userId
    )
    if (authError) {
      return {
        success: false,
        error: "DELETE_USER_AUTH_ERROR",
        details: { database: [authError.message] },
      }
    }

    // Explicitly delete the profile as a safeguard if cascade cleanup fails.
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", input.userId)

    if (profileError) {
      console.error("Error deleting user profile:", profileError.message)
    }

    revalidatePath(appRoutes.dashboard.users)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
