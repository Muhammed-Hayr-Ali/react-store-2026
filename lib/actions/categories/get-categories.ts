"use server"

/**
 * @file Server Action for fetching a list of product categories.
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "./types"

/**
 * Fetches a list of categories based on optional filters.
 * @param parentId Optional parent category ID to fetch subcategories.
 * @param activeOnly If true, only returns active categories (Default: true).
 * @returns An `ApiResult` containing an array of categories.
 */
export async function getCategories({
  parentId,
  activeOnly = true,
}: {
  parentId?: string | null
  activeOnly?: boolean
} = {}): Promise<ApiResult<Category[]>> {
  // 1. Create a Supabase client for server-side operations.
  const supabase = await createServerClient()

  // 2. Build the base query with default ordering.
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  // 3. Apply optional filters.
  if (parentId !== undefined) {
    query = query.eq("parent_id", parentId)
  }

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  // 4. Execute the query and handle the response.
  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: error.message || "FETCH_CATEGORIES_ERROR",
    }
  }

  return { success: true, data: data as Category[] }
}