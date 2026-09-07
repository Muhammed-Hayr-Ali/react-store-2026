"use server"

/**
 * @file Server Action for duplicating an existing product category (Admin only).
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "./types"
import { getUserRole } from "../utils/role-checker"

/**
 * Duplicates an existing product category. Restricted to admins only.
 * @param id The ID of the category to be duplicated.
 * @returns An `ApiResult` indicating success or failure, with the new category data.
 */
export async function duplicateCategory(
  id: string
): Promise<ApiResult<Category | null>> {
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

  // 3. Fetch the original category data from the database.
  const { data: originalCategory, error: fetchError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !originalCategory) {
    return {
      success: false,
      error: "CATEGORY_NOT_FOUND",
    }
  }

  // 4. Prepare the duplicated data.
  // We generate a short random suffix for the slug to prevent unique constraint
  // violations if the user clicks "duplicate" multiple times rapidly.
  const randomSuffix = Math.random().toString(36).substring(2, 6)

  const duplicatedData = {
    name: `${originalCategory.name} (Copy)`,
    name_ar: originalCategory.name_ar
      ? `${originalCategory.name_ar} (نسخة)`
      : null,
    slug: `${originalCategory.slug}-copy-${randomSuffix}`,
    description: originalCategory.description,
    parent_id: originalCategory.parent_id,
    is_active: originalCategory.is_active,
    sort_order: originalCategory.sort_order,
    image_url: originalCategory.image_url,
    image_alt: originalCategory.image_alt,
  }

  // 5. Attempt to insert the new duplicated category into the database.
  const { data: newCategory, error: insertError } = await supabase
    .from("categories")
    .insert(duplicatedData)
    .select()
    .single()

  // 6. Handle errors, specifically checking for unique constraint violations.
  if (insertError) {
    if (insertError.code === "23505") {
      // Unique violation
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }
    return {
      success: false,
      error: insertError.message || "DUPLICATE_CATEGORY_ERROR",
    }
  }

  // 7. Return the newly created category.
  return { success: true, data: newCategory as Category }
}
