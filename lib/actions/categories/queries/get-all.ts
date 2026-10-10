/**
 * @file lib/actions/categories/queries/get-all.ts
 * @description Paginated categories query supporting search, filters, exact count, and view guards.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { categorySchema, getCategoriesFilterSchema } from "../schemas"
import { ApiResult, Category, GetCategoriesFilterOptions } from "../types"

export async function getAllCategories(
  options: Partial<GetCategoriesFilterOptions> = {}
): Promise<ApiResult<{ items: Category[]; total: number }>> {
  // 1. Sanitize & validate filter inputs
  const parsedFilter = getCategoriesFilterSchema.safeParse(options)
  if (!parsedFilter.success) {
    return { success: false, error: "INVALID_FILTER_OPTIONS" }
  }

  const { search, parent_id, is_active, page, limit } = parsedFilter.data

  // 2. Enforce VIEW permission guard
  const canViewManagement = await hasPermission(
    PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT
  )
  if (!canViewManagement && is_active === false) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 3. Initialize Supabase Client
  const supabase = await createServerClient()

  // 4. Build paginated query with exact count
  const offset = (page - 1) * limit
  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,name_ar.ilike.%${search}%,slug.ilike.%${search}%`
    )
  }

  if (parent_id !== undefined) {
    query = query.eq("parent_id", parent_id)
  }

  // If user has management access, obey filter; otherwise, strictly enforce is_active = true
  if (canViewManagement) {
    if (is_active !== undefined) {
      query = query.eq("is_active", is_active)
    }
  } else {
    query = query.eq("is_active", true)
  }

  const { data, count, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database response
  const parsedItems = z.array(categorySchema).safeParse(data ?? [])
  if (!parsedItems.success) {
    console.error(
      "Database schema mismatch in getAllCategories:",
      parsedItems.error
    )
    return { success: false, error: "DATA_VALIDATION_ERROR" }
  }

  return {
    success: true,
    data: {
      items: parsedItems.data,
      total: count ?? 0,
    },
  }
}
