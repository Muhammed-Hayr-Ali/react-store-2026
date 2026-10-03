/**
 * @file lib/actions/categories/queries/get-by-id.ts
 * @description Query to retrieve a single category by primary key UUID.
 * Handles missing records gracefully by returning null without throwing database errors.
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

export async function getCategoryById(
  id: string
): Promise<ApiResult<Category | null>> {
  // 1. Validate UUID parameter format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Query record by primary key
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", idValidation.data)
    .single()

  // 4. Handle "Not Found" case gracefully (PGRST116 indicates 0 rows returned)
  if (error && error.code === "PGRST116") {
    return {
      success: true,
      data: null,
    }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_ID_ERROR",
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
      "Database schema mismatch in getCategoryById:",
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
