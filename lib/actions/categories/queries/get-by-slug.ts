/**
 * @file lib/actions/categories/queries/get-by-slug.ts
 * @description Query to fetch a category by unique URL slug.
 * Used for dynamic routing at `/[locale]/category/[slug]` with trimmed input sanitization.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "../types"
import { categorySchema } from "../schemas"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getCategoryBySlug(
  slug: string
): Promise<ApiResult<Category | null>> {
  // 1. Validate and trim slug parameter
  const slugValidation = z
    .string()
    .trim()
    .min(1, "SLUG_REQUIRED")
    .safeParse(slug)

  if (!slugValidation.success) {
    return {
      success: false,
      error: "INVALID_SLUG",
    }
  }

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Query record by unique slug
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slugValidation.data)
    .single()

  // 4. Handle missing record gracefully
  if (error && error.code === "PGRST116") {
    return {
      success: true,
      data: null,
    }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_SLUG_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return {
      success: true,
      data: null,
    }
  }

  // 5. Verify database response with Zod schema
  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch in getCategoryBySlug:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return {
    success: true,
    data: parsedData.data,
  }
}
