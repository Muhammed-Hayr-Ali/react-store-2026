/**
 * @file lib/actions/categories/queries/get-all.ts
 * @description Query to retrieve categories supporting optional parent filtering and active status flags.
 * Results are ordered by sort_order ascending, followed by name ascending.
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

export interface GetAllCategoriesOptions {
  parentId?: string | null
  activeOnly?: boolean
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getAllCategories({
  parentId,
  activeOnly = true,
}: GetAllCategoriesOptions = {}): Promise<ApiResult<Category[]>> {
  // 1. Validate parentId if provided
  if (parentId !== undefined && parentId !== null) {
    const parentValidation = z
      .string()
      .uuid("INVALID_PARENT_ID")
      .safeParse(parentId)
    if (!parentValidation.success) {
      return {
        success: false,
        error: "INVALID_PARENT_ID",
      }
    }
  }

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Build query with ordering defaults
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  // 4. Apply optional filters
  if (parentId !== undefined) {
    if (parentId === null) {
      query = query.is("parent_id", null)
    } else {
      query = query.eq("parent_id", parentId)
    }
  }

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify returned array against schema
  const parsedData = z.array(categorySchema).safeParse(data ?? [])
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch in getAllCategories:",
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
