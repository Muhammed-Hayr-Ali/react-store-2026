/**
 * @file lib/actions/categories/mutations/create-category.ts
 * @description Creates a category after permission, input, and hierarchy checks.
 */

"use server"

import { revalidatePath } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "../../role"
import { categoryFormSchema, type CategoryInput } from "../schemas"
import type { Category } from "../types"
import { validateCategoryParent } from "../helpers"
import { getValidationDetails } from "../../validation"

export async function createCategory(
  input: CategoryInput
): Promise<ApiResult<Category>> {
  if (!(await hasPermission(PERMISSIONS.CREATE_CATEGORY))) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = categoryFormSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const parentValidation = await validateCategoryParent(
    supabase,
    validation.data.parent_id
  )
  if (!parentValidation.success) return parentValidation

  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...validation.data,
      image_url: validation.data.image_url || null,
    })
    .select("*")
    .single()

  if (error) {
    const isSlugConflict =
      error.code === "23505" && error.message.toLowerCase().includes("slug")
    return {
      success: false,
      error: isSlugConflict
        ? "CATEGORY_SLUG_ALREADY_EXISTS"
        : "CREATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: data as Category }
}
