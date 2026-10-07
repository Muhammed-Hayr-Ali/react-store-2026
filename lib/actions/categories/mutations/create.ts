/**
 * @file lib/actions/categories/mutations/create.ts
 * @description Server Action to insert a new product category into Supabase.
 * Enforces Zod schema parsing, permission verification, duplicate slug detection, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "../types"
import { categorySchema, createCategorySchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function createCategory(
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // 1. Validate payload against Zod schema
  const validation = createCategorySchema.safeParse(payload)
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

  // 2. Perform permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_CATEGORY)
  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Insert category record into database
  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert(safeData)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database response matches entity schema
  const parsedData = categorySchema.safeParse(newCategory)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on createCategory:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 6. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
