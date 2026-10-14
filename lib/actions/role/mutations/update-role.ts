/**
 * @file lib/actions/role/mutations/update-role.ts
 * @description Server Action to update an existing role's permissions or description.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getValidationDetails } from "../../validation"
import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { hasPermission, PERMISSIONS } from "../index"
import {
  updateRolePermissionsSchema,
  type UpdateRolePermissionsInput,
} from "../schemas"
import type { RoleRecord } from "./create-role"

export async function updateRole(
  input: UpdateRolePermissionsInput
): Promise<ApiResult<RoleRecord>> {
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_ROLE)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const validation = updateRolePermissionsSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }
  const { roleId, description, permissions } = validation.data
  const supabase = await createServerClient()

  const updatePayload: { permissions: string[]; description?: string | null } =
    {
      permissions,
    }
  if (description !== undefined) {
    updatePayload.description = description
  }

  const { data: updatedRole, error } = await supabase
    .from("roles")
    .update(updatePayload)
    .eq("id", roleId)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: "UPDATE_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: updatedRole as RoleRecord,
  }
}
