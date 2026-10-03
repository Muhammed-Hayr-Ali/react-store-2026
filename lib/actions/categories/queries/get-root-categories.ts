/**
 * @file lib/actions/categories/queries/get-root-categories.ts
 * @description Query to retrieve top-level categories where `parent_id` is null.
 * Commonly consumed by homepage category banners and primary navigation bars.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category } from "../types"
import { categorySchema } from "../schemas"

// ============================================================================
// Parameter Interfaces
// ============================================================================

export interface GetRootCategoriesOptions {
  activeOnly?: boolean
  limit?: number
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getRootCategories(
  options: GetRootCategoriesOptions = {}
): Promise<ApiResult<Category[]>> {
  const { activeOnly = true, limit } = options

  try {
    const supabase = await createServerClient()

    let query = supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
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
      return {
        success: false,
        error: "FETCH_ROOT_CATEGORIES_ERROR",
        details: { database: [error.message] },
      }
    }

    // Verify returned array against schema
    const parsedData = z.array(categorySchema).safeParse(data ?? [])
    if (!parsedData.success) {
      console.error(
        "Database schema mismatch in getRootCategories:",
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

    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
