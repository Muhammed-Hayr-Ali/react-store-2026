/**
 * @file lib/actions/brands/queries/get-by-slug.ts
 * @description Server query to fetch a brand by its unique URL slug.
 * Serves dynamic routing pages like `/[locale]/brand/[slug]` with normalized input validation.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand } from "../types"
import { brandSchema } from "../schemas"

// ============================================================================
// Main Query
// ============================================================================

export async function getBrandBySlug(
  slug: string
): Promise<ApiResult<Brand | null>> {
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

  // 3. Query record by unique slug column
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slugValidation.data)
    .single()

  // 4. Handle "Not Found" case gracefully
  if (error && error.code === "PGRST116") {
    return {
      success: true,
      data: null,
    }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_BRAND_BY_SLUG_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database output schema
  const parsedData = brandSchema.safeParse(data)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch in getBrandBySlug:",
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
