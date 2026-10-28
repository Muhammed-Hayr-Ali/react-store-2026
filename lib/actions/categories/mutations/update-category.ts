/**
 * @file lib/actions/categories/mutations/update-category.ts
 * @description Replaces a category after permission and hierarchy checks.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

 import { getValidationDetails } from "../../validation"
import { validateCategoryParent } from "../helpers"
import { updateCategorySchema, type UpdateCategoryInput } from "../schemas"
import type { Category } from "../types"

export async function updateCategory(
  input: UpdateCategoryInput
): Promise<ApiResult<Category>> {
 
  const validation = updateCategorySchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { id, ...category } = validation.data

  const supabase = await createServerClient()
  const parentValidation = await validateCategoryParent(
    supabase,
    category.parent_id,
    id
  )
  if (!parentValidation.success) return parentValidation

  const { data, error } = await supabase
    .from("categories")
    .update({
      ...category,
      image_url: category.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()

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
      error: "UPDATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "CATEGORY_NOT_FOUND" }
  }

  revalidatePath("/", "layout")
  return { success: true, data: data as Category }
}
