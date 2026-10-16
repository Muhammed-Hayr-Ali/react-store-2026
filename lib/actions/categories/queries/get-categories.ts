/**
 * @file lib/actions/categories/queries/get-categories.ts
 * @description Retrieves categories in display order with optional management filters.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { getCategoriesSchema, type GetCategoriesInput } from "../schemas"
import type { Category } from "../types"

/**
 * تجلب التصنيفات مع تطبيق مرشحات الحالة والأب.
 */
export async function getCategories(
  input: GetCategoriesInput = {}
): Promise<ApiResult<Category[]>> {
  const validation = getCategoriesSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { includeInactive, parentId } = validation.data
  if (includeInactive) {
    const canViewManagement = await hasPermission(
      PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT
    )
    if (!canViewManagement) {
      return { success: false, error: "PERMISSION_DENIED" }
    }
  }

  const supabase = await createServerClient()
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  if (parentId === null) {
    query = query.is("parent_id", null)
  } else if (parentId) {
    query = query.eq("parent_id", parentId)
  }

  const { data, error } = await query
  if (error) {
    return {
      success: false,
      error: "GET_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: (data ?? []) as Category[] }
}
