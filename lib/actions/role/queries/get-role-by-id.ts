/**
 * @file lib/actions/role/queries/get-role-by-id.ts
 * @description Retrieves a role by ID.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/actions/types/utils"
import { RoleRecord } from "../mutations/create-role"

interface GetRoleByIdInput {
  roleId: string
}

export async function getRoleById(
  input: GetRoleByIdInput
): Promise<ApiResult<RoleRecord>> {
  const idValidation = z.string().uuid().safeParse(input.roleId)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ROLE_ID",
    }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, permissions, created_at")
    .eq("id", input.roleId)
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
