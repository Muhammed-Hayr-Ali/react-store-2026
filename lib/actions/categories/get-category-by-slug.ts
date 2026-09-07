"use server"

/**
 * @file Server Action for fetching a single category by its slug.
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "./types"

/**
 * Fetches a single category by its unique URL-friendly slug.
 * @param slug The unique slug of the category.
 * @returns An `ApiResult` containing the category or null if not found.
 */
export async function getCategoryBySlug(slug: string): Promise<ApiResult<Category | null>> {
  // 1. Create a Supabase client for server-side operations.
  const supabase = await createServerClient()

  // 2. Attempt to fetch the category by slug.
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  // 3. Handle "Not Found" gracefully (PostgREST code PGRST116).
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  // 4. Handle other unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "FETCH_CATEGORY_BY_SLUG_ERROR",
    }
  }

  return { success: true, data: data as Category }
}