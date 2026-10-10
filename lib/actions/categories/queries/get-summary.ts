/**
 * @file lib/actions/categories/queries/get-summary.ts
 * @description Statistical aggregation query for admin dashboard overview cards.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { ApiResult, CategoriesSummary } from "../types"

export async function getCategoriesSummary(): Promise<ApiResult<CategoriesSummary>> {
  // Permission Guard
  const canView = await hasPermission(PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT)
  if (!canView) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, is_active, parent_id")

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORIES_SUMMARY_ERROR",
      details: { database: [error.message] },
    }
  }

  const records = data ?? []
  const total = records.length
  const active = records.filter((c) => c.is_active).length
  const inactive = total - active
  const root = records.filter((c) => c.parent_id === null).length
  const subcategories = total - root

  return {
    success: true,
    data: {
      total,
      active,
      inactive,
      root,
      subcategories,
    },
  }
}