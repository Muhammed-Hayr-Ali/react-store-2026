/**
 * @file lib/actions/role/mutations/create-role.ts
 * @description Creates a role with its assigned permissions.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS, AppPermission } from "../index"
import { createRoleSchema, CreateRoleInput } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"


export interface RoleRecord {
  id: string
  name: string
  description: string | null
  permissions: AppPermission[]
  created_at: string
}

export async function createRole(
  input: CreateRoleInput
): Promise<ApiResult<RoleRecord>> {
  const canCreate = await hasPermission(PERMISSIONS.CREATE_ROLE)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = createRoleSchema.safeParse(input)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details: fieldErrors }
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
    if (error.code === "23505") {
      return { success: false, error: "ROLE_ALREADY_EXISTS" }
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
