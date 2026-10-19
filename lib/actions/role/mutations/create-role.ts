/**
 * @file lib/actions/role/mutations/create-role.ts
 * @description Creates a role with its assigned permissions.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { hasPermission, PERMISSIONS } from "../index"
import type { RoleRecord } from "../types"
import { createRoleSchema, type CreateRoleInput } from "../schemas"

export async function createRole(
  input: CreateRoleInput
): Promise<ApiResult<RoleRecord>> {
  const canCreate = await hasPermission(PERMISSIONS.CREATE_ROLE)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = createRoleSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { name, description, permissions } = validation.data
  const supabase = await createServerClient()

  // Supabase serializes this array as JSON for the jsonb permissions column.
  const { data: newRole, error } = await supabase
    .from("roles")
    .insert({
      name,
      description: description || null,
      permissions: permissions,
    })
    .select()
    .single()

  if (error) {
    if (
      error.code === "23505" &&
      error.message.toLowerCase().includes("roles_name_key")
    ) {
      return {
        success: false,
        error: "ROLE_ALREADY_EXISTS",
        details: { database: [error.message] },
      }
    }

    return {
      success: false,
      error: "CREATE_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: newRole as RoleRecord,
  }
}
