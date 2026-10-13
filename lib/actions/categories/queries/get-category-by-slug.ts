/**
 * @file lib/actions/categories/queries/get-category-by-slug.ts
 * @description Retrieves an active category by its public URL slug.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { categorySlugSchema, type CategorySlugInput } from "../schemas"
import type { Category } from "../types"
import { getValidationDetails } from "../helpers"

export async function getCategoryBySlug(
  input: CategorySlugInput
): Promise<ApiResult<Category>> {
  const validation = categorySlugSchema.safeParse(input)
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
    .eq("slug", validation.data.slug)
    .eq("is_active", true)
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
