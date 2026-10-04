/**
 * @file lib/actions/role/mutations/assign-user-role.ts
 * @description Server Action to associate a role with a user in user_roles.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../index"
import { assignUserRoleSchema, AssignUserRoleInput } from "../schemas"

export async function assignRoleToUser(
  payload: AssignUserRoleInput
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canAssign = await hasPermission(PERMISSIONS.ASSIGN_ROLE)
  if (!canAssign) {
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

  // 3. Check for existing assignment
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

  // 4. Insert into user_roles
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

  // 5. Invalidate global layout cache
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
