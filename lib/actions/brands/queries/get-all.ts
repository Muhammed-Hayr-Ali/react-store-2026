/**
 * @file lib/actions/brands/queries/get-all.ts
 * @description Server query to retrieve all active brands ordered alphabetically by name.
 * Verifies the result set against the brand schema array to ensure frontend contract integrity.
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

export async function getAllBrands(): Promise<ApiResult<Brand[]>> {
  // 1. Initialize Supabase client
  const supabase = await createServerClient()

  // 2. Fetch all brands sorted alphabetically
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return {
      success: false,
      error: "FETCH_BRANDS_ERROR",
      details: { database: [error.message] },
    }
  }

  // 3. Verify output schema on array of entities
  const parsedData = z.array(brandSchema).safeParse(data || [])
  if (!parsedData.success) {
    console.error("Database schema mismatch in getAllBrands:", parsedData.error)
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

// ============================================================================
// Backward Compatibility Alias
// ============================================================================

export const getAllBrand = getAllBrands
