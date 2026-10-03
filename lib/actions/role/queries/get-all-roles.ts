/**
 * @file lib/actions/role/queries/get-all-roles.ts
 * @description Fetch all system roles and their permissions.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { RoleRecord } from "../mutations/create-role"

export async function getAllRoles(): Promise<ApiResult<RoleRecord[]>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, permissions, created_at")
    .order("created_at", { ascending: true })

  if (error) {
    return {
      success: false,
      error: "GET_ALL_ROLES_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: (data || []) as RoleRecord[],
  }
}
