/**
 * @file lib/actions/users/mutations/update-user-status.ts
 * @description Server Action to change a user's status (active, suspended, banned).
 */

"use server"

import { revalidatePath } from "next/cache"
import { getValidationDetails } from "../../validation"
import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"
import {
  updateUserStatusSchema,
  type UpdateUserStatusFormValues,
} from "../schemas"
import { appRoutes } from "@/lib/config/app-routes"

export async function updateUserStatus(
  input: UpdateUserStatusFormValues
): Promise<ApiResult<null>> {
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_USER)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = updateUserStatusSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
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

    revalidatePath(appRoutes.dashboard.users)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
