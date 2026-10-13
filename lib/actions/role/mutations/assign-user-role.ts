/**
 * @file lib/actions/role/mutations/assign-user-role.ts
 * @description Server Action to associate a role with a user in user_roles.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../index"
import { assignUserRoleSchema, AssignUserRoleInput } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"

export async function assignRoleToUser(
  input: AssignUserRoleInput
): Promise<ApiResult<null>> {
  const canAssign = await hasPermission(PERMISSIONS.ASSIGN_ROLE)
  if (!canAssign) {
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

  const { data: existingAssignment } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_id", roleId)
    .maybeSingle()

  if (existingAssignment) {
    return {
      success: false,
      error: "ROLE_ALREADY_ASSIGNED",
    }
  }

  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  })

  if (error) {
    return {
      success: false,
      error: "ASSIGN_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
