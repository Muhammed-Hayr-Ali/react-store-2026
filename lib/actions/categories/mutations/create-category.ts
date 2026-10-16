/**
 * @file lib/actions/categories/mutations/create-category.ts
 * @description Creates a category after permission, input, and hierarchy checks.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { validateCategoryParent } from "../helpers"
import { categoryFormSchema, type CategoryInput } from "../schemas"
import type { Category } from "../types"

/**
 * تنشئ تصنيفًا بعد التحقق من الصلاحية والمدخلات وعلاقة الأب.
 */
export async function createCategory(
  input: CategoryInput
): Promise<ApiResult<Category>> {
  const canCreate = await hasPermission(PERMISSIONS.CREATE_CATEGORY)
  if (!canCreate) {
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
    if (
      error.code === "23505" &&
      error.message.toLowerCase().includes("slug")
    ) {
      return {
        success: false,
        error: "CATEGORY_SLUG_ALREADY_EXISTS",
        details: { database: [error.message] },
      }
    }

    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: data as Category }
}
