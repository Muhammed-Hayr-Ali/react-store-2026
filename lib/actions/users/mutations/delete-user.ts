/**
 * @file lib/actions/users/mutations/delete-user.ts
 * @description Server Action to completely delete a user from auth and profiles.
 */

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"
import { appRoutes } from "@/lib/config/app-routes"

export async function deleteUser(userId: string): Promise<ApiResult<null>> {
  // 1. Permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_USER)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 2. Validate input schema
  const idValidation = z.string().uuid().safeParse(userId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_USER_ID" }
  }

  try {
    const supabase = await createAdminClient()

    // 3. Delete from auth (Admin API)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      return {
        success: false,
        error: "DELETE_USER_AUTH_ERROR",
        details: { database: [authError.message] },
      }
    }

    // 4. Delete profile (Cascade should handle this usually, but good for safety)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error("Error deleting user profile:", profileError.message)
    }

    revalidatePath(appRoutes.dashboard.admin.users)
    return { success: true, data: null }
  } catch (err) {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
