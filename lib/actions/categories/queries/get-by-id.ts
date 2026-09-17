"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "../types"

export async function getCategoryById(
  id: string
): Promise<ApiResult<Category | null>> {
  // initialize Supabase client
  const supabase = await createServerClient()

  // Attempt to fetch the category by slug.
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  // Handle "Not Found" gracefully (PostgREST code PGRST116).
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  // Handle other unexpected errors.
  if (error) {
    return {
      success: false,
      error: error.message || "FETCH_CATEGORY_BY_SLUG_ERROR",
    }
  }

  return { success: true, data: data as Category }
}
