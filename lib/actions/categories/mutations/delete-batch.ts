/**
 * @file lib/actions/categories/mutations/delete-batch.ts
 * @description Server Action to bulk-delete categories with relational safety guards.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { deleteBatchCategoriesSchema } from "../schemas"
import { ApiResult, BatchCountResult } from "../types"

export async function deleteBatchCategories(
  payload: unknown
): Promise<ApiResult<BatchCountResult>> {
  // Step 1: Input Validation
  const validation = deleteBatchCategoriesSchema.safeParse(payload)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".") || "ids"
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  const { ids } = validation.data

  // Step 2: Permission Enforcement & Authentication
  const canPerform = await hasPermission(PERMISSIONS.DELETE_CATEGORY)
  if (!canPerform) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Step 3: Supabase Client Initialization
  const supabase = await createServerClient()

  // Step 4: Database Execution & Relational Guard
  const { count: linkedProductsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .in("category_id", ids)

  if (linkedProductsCount && linkedProductsCount > 0) {
    return {
      success: false,
      error: "CATEGORIES_HAVE_PRODUCTS",
      details: {
        products: [
          `Selected categories contain ${linkedProductsCount} linked products. Delete or reassign products first.`,
        ],
      },
    }
  }

  const { error } = await supabase.from("categories").delete().in("id", ids)

  if (error) {
    return {
      success: false,
      error: "DELETE_BATCH_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  // Step 5: Runtime Entity Validation
  const resultData: BatchCountResult = { count: ids.length }

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: resultData }
}
