"use server"

/**
 * @file lib/actions/role/mutations/delete-role.ts
 * @description Server Action to delete a role that has no user assignments.
 */

import { revalidatePath } from "next/cache"
import { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../index"
import { deleteRoleSchema, DeleteRoleInput } from "../schemas"

// Delete a role only when no user currently depends on it.
export async function deleteRole(
  input: DeleteRoleInput
): Promise<ApiResult<null>> {
  // Require deletion permission before validating or accessing role data.
  const canDelete = await hasPermission(PERMISSIONS.DELETE_ROLE)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Validate the role identifier before using it in database queries.
  const validation = deleteRoleSchema.safeParse(input)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details: fieldErrors }
  }

  const supabase = await createServerClient()
  // Block deletion before reaching the role foreign-key constraint.
  const { count, error: assignmentsError } = await supabase
    .from("user_roles")
    .select("role_id", { count: "exact", head: true })
    .eq("role_id", validation.data.roleId)

  if (assignmentsError) {
    return {
      success: false,
      error: "CHECK_ROLE_ASSIGNMENTS_ERROR",
      details: { database: [assignmentsError.message] },
    }
  }

  if (count && count > 0) {
    return { success: false, error: "ROLE_IN_USE" }
  }

  // Recheck through the delete itself to handle assignments added concurrently.
  const { data: deletedRole, error } = await supabase
    .from("roles")
    .delete()
    .eq("id", validation.data.roleId)
    .select("id")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: error.code === "23503" ? "ROLE_IN_USE" : "DELETE_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!deletedRole) {
    return { success: false, error: "ROLE_NOT_FOUND" }
  }

  revalidatePath("/", "layout")

  return { success: true, data: null }
}
