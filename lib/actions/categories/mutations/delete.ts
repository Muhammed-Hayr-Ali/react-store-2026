/**
 * @file lib/actions/categories/mutations/delete.ts
 * @description Server Action to permanently remove a category record by UUID.
 * Verifies ID structure, confirms permission access, and purges stale route caches.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

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

  // 2. Perform permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_CATEGORY)
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

  // 5. Invalidate stale cache paths (المتجر واللوحة بالكامل)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
