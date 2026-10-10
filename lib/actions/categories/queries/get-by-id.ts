/**
 * @file lib/actions/categories/queries/get-by-id.ts
 * @description Query to retrieve a category by primary key UUID with graceful not-found handling.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { categorySchema } from "../schemas"
import { ApiResult, Category } from "../types"

export async function getCategoryById(
  id: string
): Promise<ApiResult<Category | null>> {
  const idValidation = z.string().uuid("INVALID_CATEGORY_ID").safeParse(id)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_CATEGORY_ID" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", idValidation.data)
    .single()

  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: true, data: null }
  }

  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database schema mismatch in getCategoryById:", parsedData.error)
    return { success: false, error: "DATA_VALIDATION_ERROR" }
  }

  return { success: true, data: parsedData.data }
}