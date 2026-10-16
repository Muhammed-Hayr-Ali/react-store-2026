/**
 * @file lib/actions/categories/mutations/delete-category.ts
 * @description Deletes a category and lets the database detach its children.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { categoryIdSchema, type CategoryIdInput } from "../schemas"

/**
 * تحذف تصنيفًا بعد التحقق من الصلاحية ووجوده.
 */
export async function deleteCategory(
  input: CategoryIdInput
): Promise<ApiResult<null>> {
  const canDelete = await hasPermission(PERMISSIONS.DELETE_CATEGORY)
  if (!canDelete) {
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
    .delete()
    .eq("id", validation.data.id)
    .select("id")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "DELETE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "CATEGORY_NOT_FOUND" }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}
