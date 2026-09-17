"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function deleteCategory(id: string): Promise<ApiResult<null>> {
  // check if user has admin role
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // check if user has create_category permission
  const has_permission = await hasPermission("delete_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // initialize Supabase client
  const supabase = await createServerClient()

  // Attempt to update the is_active flag to false.
  const { error } = await supabase.from("categories").delete().eq("id", id)

  // Handle any unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "DELETE_CATEGORY_ERROR",
    }
  }

  // success
  return { success: true, data: null }
}
