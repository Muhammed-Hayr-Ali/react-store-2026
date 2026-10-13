/**
 * @file lib/actions/categories/queries/get-category-by-id.ts
 * @description Retrieves one category for category-management workflows.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../../role"
import { categoryIdSchema, type CategoryIdInput } from "../schemas"
import type { Category } from "../types"
import { getValidationDetails } from "../helpers"

export async function getCategoryById(
  input: CategoryIdInput
): Promise<ApiResult<Category>> {
  if (!(await hasPermission(PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT))) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = categoryIdSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", validation.data.id)
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "GET_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "CATEGORY_NOT_FOUND" }
  }

  return { success: true, data: data as Category }
}
