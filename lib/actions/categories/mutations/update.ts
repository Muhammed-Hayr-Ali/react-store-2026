/**
 * @file lib/actions/categories/mutations/update.ts
 * @description Server Action to modify an existing category record by UUID.
 * Handles partial payload sanitization, permission validation, and dynamic route revalidation.
 */


"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "../types"
import { categorySchema, updateCategorySchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateCategory(
  id: string,
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // 1. Validate UUID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Validate partial update payload
  const validation = updateCategorySchema.safeParse(payload)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  const safeData = validation.data

  // 3. Perform permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_CATEGORY)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 4. Initialize Supabase client
  const supabase = await createServerClient()

  // 5. Update record in database
  const { data: updatedCategory, error } = await supabase
    .from("categories")
    .update(safeData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "CATEGORY_NOT_FOUND",
      }
    }

    return {
      success: false,
      error: "UPDATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // 6. Verify database output against category schema
  const parsedData = categorySchema.safeParse(updatedCategory)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on updateCategory:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 7. Invalidate dynamic category page and storefront layout
  revalidatePath(`/category/${parsedData.data.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
