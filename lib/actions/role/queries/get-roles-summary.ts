/**
 * @file lib/actions/role/queries/get-roles-summary.ts
 * @description Retrieves aggregate counts for the roles dashboard summary.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { isAppPermissionArray, type RolesSummary } from "../types"

export async function getRolesSummary(): Promise<ApiResult<RolesSummary>> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("roles")
    .select("name, permissions")

  if (error) {
    return {
      success: false,
      error: "GET_ROLES_ERROR",
      details: { database: [error.message] },
    }
  }

  const roles = data ?? []
  let active = 0

  for (const role of roles) {
    if (!isAppPermissionArray(role.permissions)) {
      return {
        success: false,
        error: "GET_ROLES_ERROR",
        details: {
          database: ["A role has invalid permissions data."],
        },
      }
    }

    if (role.permissions.length > 0) active += 1
  }

  return {
    success: true,
    data: {
      total: roles.length,
      active,
      empty: roles.length - active,
    },
  }
}
