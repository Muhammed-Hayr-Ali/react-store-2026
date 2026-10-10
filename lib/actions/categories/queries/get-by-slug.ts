/**
 * @file lib/actions/categories/queries/get-by-slug.ts
 * @description Query to fetch a category by unique URL slug for dynamic storefront routing.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { categorySchema } from "../schemas"
import { ApiResult, Category } from "../types"

export async function getCategoryBySlug(
  slug: string
): Promise<ApiResult<Category | null>> {
  const slugValidation = z.string().trim().min(1, "SLUG_REQUIRED").safeParse(slug)
  if (!slugValidation.success) {
    return { success: false, error: "INVALID_SLUG" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slugValidation.data)
    .single()

  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_SLUG_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: true, data: null }
  }

  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database schema mismatch in getCategoryBySlug:", parsedData.error)
    return { success: false, error: "DATA_VALIDATION_ERROR" }
  }

  return { success: true, data: parsedData.data }
}