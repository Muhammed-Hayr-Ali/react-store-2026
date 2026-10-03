/**
 * @file lib/actions/role/mutations/remove-user-role.ts
 * @description Server Action to revoke a specific role from a user.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../index"
import { assignUserRoleSchema, AssignUserRoleInput } from "../schemas"

export async function removeRoleFromUser(
  payload: AssignUserRoleInput
): Promise<ApiResult<null>> {
  // 1. Parallel authorization checks
  const [isAdmin, canRemove] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.REMOVE_ROLE),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canRemove) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate input schema
  const validation = assignUserRoleSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { userId, roleId } = validation.data
  const supabase = await createServerClient()

  // 3. Remove record from user_roles
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

  // 4. Invalidate global layout cache
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
