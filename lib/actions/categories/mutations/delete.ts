/**
 * @file lib/actions/categories/mutations/delete.ts
 * @description Server Action to permanently remove a category record by UUID.
 * Verifies ID structure, confirms administrative access, and purges stale route caches.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteCategory(id: string): Promise<ApiResult<null>> {
  // 1. Validate UUID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Perform parallel authorization checks
  const [isAdmin, canDelete] = await Promise.all([
    hasRole("admin"),
    hasPermission("delete_category"),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Delete record from categories table
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      error: "DELETE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Invalidate paths that display categories
  revalidatePath("/admin/categories")
  revalidatePath("/")

  return {
    success: true,
    data: null,
  }
}
