"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function deleteBrand(id: string): Promise<ApiResult<null>> {
  // check if user has admin role
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // check if user has permission
  const has_permission = await hasPermission("delete_brand")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // initialize Supabase client
  const supabase = await createServerClient()

  const { error } = await supabase.from("brands").delete().eq("id", id)

  // Handle any unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "DELETE_BRAND_ERROR",
    }
  }

  // success
  return { success: true }
}
