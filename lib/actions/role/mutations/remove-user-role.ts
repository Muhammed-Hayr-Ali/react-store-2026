/**
 * @file lib/actions/role/mutations/remove-user-role.ts
 * @description Server Action to revoke a specific role from a user.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../index"
import { assignUserRoleSchema, AssignUserRoleInput } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"

export async function removeRoleFromUser(
  input: AssignUserRoleInput
): Promise<ApiResult<null>> {
  const canRemove = await hasPermission(PERMISSIONS.REMOVE_ROLE)
  if (!canRemove) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const validation = assignUserRoleSchema.safeParse(input)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  const { userId, roleId } = validation.data
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId)

  if (error) {
    return {
      success: false,
      error: "REMOVE_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
