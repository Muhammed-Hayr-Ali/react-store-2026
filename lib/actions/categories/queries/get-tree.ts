/**
 * @file lib/actions/categories/queries/get-tree.ts
 * @description Constructs an in-memory nested category tree with permission-guarded viewing.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { ApiResult, CategoryTreeNode, Category } from "../types"

export interface GetCategoryTreeOptions {
  activeOnly?: boolean
}

export async function getCategoryTree(
  options: GetCategoryTreeOptions = {}
): Promise<ApiResult<CategoryTreeNode[]>> {
  const { activeOnly = true } = options

  // Enforce management viewing permission if inspecting hidden/inactive tree nodes
  if (!activeOnly) {
    const canView = await hasPermission(PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT)
    if (!canView) {
      return { success: false, error: "PERMISSION_DENIED" }
    }
  }

  const supabase = await createServerClient()

  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_TREE_ERROR",
      details: { database: [error.message] },
    }
  }

  const categories = (data ?? []) as Category[]

  // Build tree hierarchy in O(n)
  const map = new Map<string, CategoryTreeNode>()
  const roots: CategoryTreeNode[] = []

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] })
  })

  categories.forEach((cat) => {
    const node = map.get(cat.id)!
    if (cat.parent_id) {
      const parentNode = map.get(cat.parent_id)
      if (parentNode) {
        parentNode.children.push(node)
      }
      // If parent is disabled or absent, do not promote orphan child to roots
    } else {
      roots.push(node)
    }
  })

  return { success: true, data: roots }
}
