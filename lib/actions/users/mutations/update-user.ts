/**
 * @file lib/actions/users/mutations/update-user.ts
 * @description Server Action to update user profile information.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getValidationDetails } from "../../validation"
import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"
import { updateUserSchema, type UpdateUserFormValues } from "../schemas"
import { appRoutes } from "@/lib/config/app-routes"

export async function updateUser(
  input: UpdateUserFormValues
): Promise<ApiResult<null>> {
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_USER)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = updateUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const validatedInput = validation.data

  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: validatedInput.firstName?.trim() || null,
        last_name: validatedInput.lastName?.trim() || null,
        phone_number: validatedInput.phoneNumber?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedInput.userId)

    if (error) {
      return {
        success: false,
        error: "UPDATE_USER_ERROR",
        details: { database: [error.message] },
      }
    }

    revalidatePath(appRoutes.dashboard.users)
    return { success: true, data: null }
  } catch {
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
