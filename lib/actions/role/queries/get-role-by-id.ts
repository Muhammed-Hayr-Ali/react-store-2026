/**
 * @file lib/actions/role/queries/get-role-by-id.ts
 * @description Retrieves a role by ID.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { roleIdSchema, type RoleIdInput } from "../schemas"

import type { RoleRecord } from "../types"

/**
 * تجلب دورًا واحدًا باستخدام معرّفه.
 */
export async function getRoleById(
  input: RoleIdInput
): Promise<ApiResult<RoleRecord>> {
  const canViewRoles = await hasPermission(PERMISSIONS.VIEW_ROLES_MANAGEMENT)
  if (!canViewRoles) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = roleIdSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, permissions, created_at")
    .eq("id", validation.data.roleId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "ROLE_NOT_FOUND",
      }
    }
    return {
      success: false,
      error: "GET_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: data as RoleRecord,
  }
}
