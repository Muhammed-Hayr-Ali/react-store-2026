"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, brandSchema } from "../types"

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

  // 3. Fetch record by ID
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single()

  // 4. Handle "Not Found" gracefully (PostgREST code PGRST116)
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_BRAND_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Schema verification on returned data
  const parsedData = brandSchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database data mismatch in getBrandById:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
