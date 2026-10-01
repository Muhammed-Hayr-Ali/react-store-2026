"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, brandSchema } from "../types"

export async function getBrandBySlug(
  slug: string
): Promise<ApiResult<Brand | null>> {
  // 1. Validate slug parameter
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

  // 3. Fetch record by slug
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slugValidation.data)
    .single()

  // 4. Handle "Not Found" gracefully
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_BRAND_BY_SLUG_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Schema verification on returned data
  const parsedData = brandSchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database data mismatch in getBrandBySlug:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
