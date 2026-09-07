"use server"

/**
 * @file Server Action for deactivating (soft-deleting) a category (Admin only).
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { getUserRole } from "../utils/role-checker"

/**
 * Soft-deletes a category by setting its is_active flag to false. Restricted to admins only.
 * @param id The ID of the category to deactivate.
 * @returns An `ApiResult` indicating success or failure.
 */
export async function deleteCategory(id: string): Promise<ApiResult<null>> {
  // 1. Create a Supabase client for server-side operations.
  const supabase = await createServerClient()

  // 2. Verify the user has admin privileges.
  const role = await getUserRole()
  if (role !== "admin") {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 3. Attempt to update the is_active flag to false.
  const { error } = await supabase.from("categories").delete().eq("id", id)

  // 4. Handle any unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "DELETE_CATEGORY_ERROR",
    }
  }

  return { success: true, data: null }
}
