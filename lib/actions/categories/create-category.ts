"use server"

/**
 * @file Server Action for creating a new product category (Admin only).
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, CreateCategoryData } from "./types"
import { getUserRole } from "../utils/role-checker"

/**
 * Creates a new product category. Restricted to admins only.
 * @param data The category data to be inserted.
 * @returns An `ApiResult` indicating success or failure, with the new category data.
 */
export async function createCategory(data: CreateCategoryData): Promise<ApiResult<Category | null>> {
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

  // 3. Attempt to insert the new category into the database.
  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single()

  // 4. Handle errors, specifically checking for unique constraint violations.
  if (error) {
    if (error.code === "23505") { // Unique violation (e.g., slug already exists)
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }
    return {
      success: false,
      error: error.message || "CREATE_CATEGORY_ERROR",
    }
  }

  return { success: true, data: newCategory as Category }
}