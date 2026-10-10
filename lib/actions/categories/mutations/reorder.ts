/**
 * @file lib/actions/categories/mutations/reorder.ts
 * @description Server Action to batch update category order values (Drag & Drop support).
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { reorderCategoriesSchema } from "../schemas"
import { ApiResult, BatchCountResult } from "../types"

export async function reorderCategories(
  payload: unknown
): Promise<ApiResult<BatchCountResult>> {
  // Step 1: Input Validation
  const validation = reorderCategoriesSchema.safeParse(payload)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".") || "items"
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  // Step 2: Permission Enforcement & Authentication
  const canPerform = await hasPermission(PERMISSIONS.UPDATE_CATEGORY)
  if (!canPerform) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Step 3: Supabase Client Initialization
  const supabase = await createServerClient()

  // Step 4: Database Execution & Scoping
  const updates = validation.data.items.map((item) =>
    supabase
      .from("categories")
      .update({
        sort_order: item.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
  )

  const results = await Promise.all(updates)
  const failedResult = results.find((r) => r.error !== null)

  if (failedResult?.error) {
    return {
      success: false,
      error: "REORDER_CATEGORIES_ERROR",
      details: { database: [failedResult.error.message] },
    }
  }

  // Step 5: Runtime Entity Validation
  const resultData: BatchCountResult = {
    count: validation.data.items.length,
  }

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: resultData }
}
