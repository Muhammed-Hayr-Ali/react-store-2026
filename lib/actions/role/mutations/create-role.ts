/**
 * @file lib/actions/role/mutations/create-role.ts
 * @description Server Action to define and store a new role with specific permissions.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../index"
import { createRoleSchema, CreateRoleInput } from "../schemas"

export interface RoleRecord {
  id: number
  name: string
  description: string | null
  permissions: string[]
  created_at: string
}

export async function createRole(
  payload: CreateRoleInput
): Promise<ApiResult<RoleRecord | null>> {
  // 1. Parallel authorization checks
  const [isAdmin, canCreate] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.CREATE_ROLE),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate input schema
  const validation = createRoleSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { name, description, permissions } = validation.data
  const supabase = await createServerClient()

  // 3. Insert record into roles table
  const { data: newRole, error } = await supabase
    .from("roles")
    .insert({
      name,
      description: description || null,
      permissions,
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

  // 4. Invalidate global layout cache
  revalidatePath("/", "layout")

  return {
    success: true,
    data: newRole as RoleRecord,
  }
}
