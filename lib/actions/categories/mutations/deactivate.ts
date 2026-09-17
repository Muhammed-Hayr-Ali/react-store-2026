"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function deactivateCategory(id: string): Promise<ApiResult<null>> {
  // check if user has admin role
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // check if user has deactivate_category permission
  const has_permission = await hasPermission("deactivate_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // initialize Supabase client
  const supabase = await createServerClient()

  // 3. Attempt to update the is_active flag to false.
  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("id", id)

  // 4. Handle any unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "DEACTIVATE_CATEGORY_ERROR",
    }
  }

  return { success: true, data: null }
}
