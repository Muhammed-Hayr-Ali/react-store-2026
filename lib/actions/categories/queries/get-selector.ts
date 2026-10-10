/**
 * @file lib/actions/categories/queries/get-selector.ts
 * @description Lightweight query providing minimal category fields for dropdowns and product forms.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult, CategorySelectorItem } from "../types"

export interface GetCategoriesSelectorOptions {
  activeOnly?: boolean
}

export async function getCategoriesSelector(
  options: GetCategoriesSelectorOptions = {}
): Promise<ApiResult<CategorySelectorItem[]>> {
  const { activeOnly = true } = options
  const supabase = await createServerClient()

  let query = supabase
    .from("categories")
    .select("id, name, name_ar, slug, parent_id")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORIES_SELECTOR_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: (data ?? []) as CategorySelectorItem[],
  }
}