/**
 * @file lib/actions/role/mutations/delete-role.ts
 * @description Deletes a role that has no user assignments.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { hasPermission, PERMISSIONS } from "../index"
import { deleteRoleSchema, type DeleteRoleInput } from "../schemas"

/**
 * تحذف دورًا لا يرتبط بمستخدمين.
 */
export async function deleteRole(
  input: DeleteRoleInput
): Promise<ApiResult<null>> {
  const canDelete = await hasPermission(PERMISSIONS.DELETE_ROLE)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = deleteRoleSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
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

  // The delete also catches assignments created after the initial count check.
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
