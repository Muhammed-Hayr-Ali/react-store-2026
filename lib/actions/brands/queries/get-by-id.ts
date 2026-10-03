/**
 * @file lib/actions/brands/queries/get-by-id.ts
 * @description Server query to retrieve a specific brand by its unique UUID.
 * Handles missing records gracefully without throwing unhandled database exceptions.
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

export async function getBrandById(
  id: string
): Promise<ApiResult<Brand | null>> {
  // 1. Validate ID format
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
    .from("brands")
    .select("*")
    .eq("id", id)
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
      error: "FETCH_BRAND_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database output schema
  const parsedData = brandSchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database schema mismatch in getBrandById:", parsedData.error)
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
