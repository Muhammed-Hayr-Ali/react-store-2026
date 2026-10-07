/**
 * @file lib/actions/users/mutations/update-user-status.ts
 * @description Server Action to change a user's status (active, suspended, banned).
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"
import { updateUserStatusSchema, UpdateUserStatusFormValues } from "../schemas"
import { appRoutes } from "@/lib/config/app-routes"

export async function updateUserStatus(
  payload: UpdateUserStatusFormValues
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_USER)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 2. Validate input schema
  const validation = updateUserStatusSchema.safeParse(payload)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details: fieldErrors }
  }

  const { userId, status, banReason } = validation.data

  try {
    const supabase = await createServerClient()
    const isBanned = status === "banned"

    const updatePayload = {
      status,
      ban_reason: isBanned
        ? banReason?.trim() || "Administrative action"
        : null,
      banned_at: isBanned ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)

    if (error) {
      return {
        success: false,
        error: "UPDATE_STATUS_ERROR",
        details: { database: [error.message] },
      }
    }

    revalidatePath(appRoutes.dashboard.admin.users)
    return { success: true, data: null }
  } catch (err) {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
