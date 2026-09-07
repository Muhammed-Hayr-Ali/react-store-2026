"use server"

/**
 * @file Server Action for updating an existing product category (Admin only).
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, UpdateCategoryData } from "./types"
import { getUserRole } from "../utils/role-checker"

/**
 * Updates an existing product category. Restricted to admins only.
 * @param id The ID of the category to update.
 * @param data The partial data to update.
 * @returns An `ApiResult` indicating success or failure, with the updated category data.
 */
export async function updateCategory(id: string, data: UpdateCategoryData): Promise<ApiResult<Category | null>> {
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

  // 3. Attempt to update the category in the database.
  const { data: updatedCategory, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  // 4. Handle errors, specifically checking for unique constraint violations.
  if (error) {
    if (error.code === "23505") { // Unique violation
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }
    return {
      success: false,
      error: error.message || "UPDATE_CATEGORY_ERROR",
    }
  }

  return { success: true, data: updatedCategory as Category }
}