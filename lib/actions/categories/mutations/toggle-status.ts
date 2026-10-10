/**
 * @file lib/actions/categories/mutations/toggle-status.ts
 * @description Server Action to toggle category active status with 6-step compliance.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { toggleCategoryStatusSchema } from "../schemas"
import { ApiResult } from "../types"

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const parsed = toggleCategoryStatusSchema.safeParse({
    id,
    is_active: isActive,
  })
  if (!parsed.success) {
    const details: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".")
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
  const { data, error } = await supabase
    .from("categories")
    .update({
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "CATEGORY_NOT_FOUND" }
    }
    return {
      success: false,
      error: "TOGGLE_CATEGORY_STATUS_ERROR",
      details: { database: [error.message] },
    }
  }

  // Step 5: Runtime Entity Validation (null return)

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: null }
}
