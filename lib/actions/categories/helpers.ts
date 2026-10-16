/**
 * @file lib/actions/categories/helpers.ts
 * @description Validates category parent relationships for category actions.
 */

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

/**
 * تتحقق من وجود أب التصنيف وخلو سلسلة الآباء من الدورات.
 */
export async function validateCategoryParent(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  parentId: string | null,
  categoryId?: string
): Promise<ApiResult<null>> {
  const visited = new Set<string>()
  let currentId = parentId

  while (currentId) {
    if (currentId === categoryId || visited.has(currentId)) {
      return { success: false, error: "INVALID_CATEGORY_PARENT" }
    }

    visited.add(currentId)

    const { data, error } = await supabase
      .from("categories")
      .select("parent_id")
      .eq("id", currentId)
      .maybeSingle()

    if (error) {
      return {
        success: false,
        error: "CHECK_CATEGORY_PARENT_ERROR",
        details: { database: [error.message] },
      }
    }

    if (!data) {
      return { success: false, error: "PARENT_CATEGORY_NOT_FOUND" }
    }

    currentId = data.parent_id
  }

  return { success: true, data: null }
}
