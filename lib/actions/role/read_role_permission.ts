"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Role } from "./role-checker"

// Read roles and permissions

export async function readRolesAndPermissions(): Promise<ApiResult<Role>> {
  const supabase = await createServerClient()

  const { data: data, error } = await supabase.rpc(
    "read_roles_and_permissions"
  )

  if (error) {
    return {
      success: false,
      error: "READ_ROLES_AND_PERMISSIONS_FAILED",
      details: {
        error: [error.message],
      },
    }
  }

  return {
    success: true,
    data,
  }
}
