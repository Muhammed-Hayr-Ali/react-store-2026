"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, categorySchema } from "../types"

interface GetRootCategoriesOptions {
  activeOnly?: boolean
  limit?: number
}

/**
 * جلب التصنيفات الرئيسية فقط (parent_id IS NULL)
 */
export async function getRootCategories(
  options: GetRootCategoriesOptions = {}
): Promise<ApiResult<Category[]>> {
  const { activeOnly = true, limit } = options

  try {
    const supabase = await createServerClient()

    let query = supabase
      .from("categories")
      .select("*")
      .is("parent_id", null) // شرط التصنيفات الرئيسية فقط
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    if (limit !== undefined && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [GetRootCategories] DB Error:", error.message)
      return {
        success: false,
        error: "FETCH_ROOT_CATEGORIES_ERROR",
        details: { database: [error.message] },
      }
    }

    // التحقق من صحة مصفوفة البيانات عبر Zod
    const parsedData = z.array(categorySchema).safeParse(data ?? [])
    if (!parsedData.success) {
      console.error(
        "❌ [GetRootCategories] Data Validation Error:",
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
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred"

    console.error("❌ [GetRootCategories] Unexpected Error:", errorMessage)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
