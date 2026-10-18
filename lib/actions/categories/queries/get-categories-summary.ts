/**
 * @file lib/actions/categories/queries/get-categories-summary.ts
 * @description Retrieves aggregate counts for the categories dashboard summary.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { CategoriesSummary } from "../types"

export async function getCategoriesSummary(): Promise<
  ApiResult<CategoriesSummary>
> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("categories")
    .select("is_active")

  if (error) {
    return {
      success: false,
      error: "GET_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  const categories = (data ?? []) as Array<{ is_active: boolean }>
  const active = categories.filter((category) => category.is_active).length

  return {
    success: true,
    data: {
      total: categories.length,
      active,
      inactive: categories.length - active,
    },
  }
}
