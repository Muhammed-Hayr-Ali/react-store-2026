/**
 * @file lib/actions/role/mutations/update-role.ts
 * @description Server Action to update an existing role's permissions or description.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../index"
import {
  updateRolePermissionsSchema,
  UpdateRolePermissionsInput,
} from "../schemas"
import { RoleRecord } from "./create-role"

export async function updateRole(
  payload: UpdateRolePermissionsInput
): Promise<ApiResult<RoleRecord | null>> {
  // 1. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_ROLE)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate input schema
  const validation = updateRolePermissionsSchema.safeParse(payload)
if (!validation.success) {
  // طريقة حديثة وآمنة لتجميع الأخطاء بدون استخدام الدوال الـ deprecated أو غير الموجودة
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of validation.error.issues) {
    const path = issue.path.join(".")
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(issue.message)
  }

  console.error("Validation Error Details:", fieldErrors)

  return {
    success: false,
    error: "VALIDATION_ERROR",
    details: fieldErrors,
  }
}
  const { roleId, description, permissions } = validation.data
  const supabase = await createServerClient()

  // 3. Update record in roles table
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

  // 4. Invalidate global layout cache
  revalidatePath("/", "layout")

  return {
    success: true,
    data: updatedRole as RoleRecord,
  }
}
