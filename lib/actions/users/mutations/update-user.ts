/**
 * @file lib/actions/users/mutations/update-user.ts
 * @description Server Action to update user profile information.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"
import { updateUserSchema, UpdateUserFormValues } from "../schemas"
import { appRoutes } from "@/lib/config/app-routes"

export async function updateUser(
  payload: UpdateUserFormValues
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_USER)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 2. Validate input schema
  const validation = updateUserSchema.safeParse(payload)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details: fieldErrors }
  }

  const params = validation.data

  try {
    const supabase = await createServerClient()

    // 3. Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: params.firstName?.trim() || null,
        last_name: params.lastName?.trim() || null,
        phone_number: params.phoneNumber?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId)

    if (error) {
      return {
        success: false,
        error: "UPDATE_USER_ERROR",
        details: { database: [error.message] },
      }
    }

    revalidatePath(appRoutes.dashboard.admin.users)
    return { success: true, data: null }
  } catch (err) {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
