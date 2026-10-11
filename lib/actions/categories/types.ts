/**
 * @file lib/actions/categories/types.ts
 * @description Inferred TypeScript types and presentation models for the Categories domain.
 */

import { z } from "zod"
import { Database } from "../types/database" // 👈 الربط المباشر مع قاعدة البيانات
import {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryStatusSchema,
  getCategoriesFilterSchema,
  reorderCategoriesSchema,
  deleteBatchCategoriesSchema,
} from "./schemas"

// ============================================================================
// Shared API Result Contract
// ============================================================================
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

// ============================================================================
// Entity Types (Mapped 1:1 to Database)
// ============================================================================
export type CategoryRecord = Database["public"]["Tables"]["categories"]["Row"]
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"]
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"]

// ============================================================================
// Input Types (Inferred from Zod)
// ============================================================================
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ToggleCategoryStatusInput = z.infer<
  typeof toggleCategoryStatusSchema
>
export type GetCategoriesFilterOptions = z.infer<
  typeof getCategoriesFilterSchema
>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>
export type DeleteBatchCategoriesInput = z.infer<
  typeof deleteBatchCategoriesSchema
>

// ============================================================================
// Presentation & Relational Models
// ============================================================================
export interface CategoryWithParent extends CategoryRecord {
  parent?: {
    id: string
    name: string
    name_ar: string | null
    slug: string
  } | null
}

export interface CategoryTreeNode extends CategoryRecord {
  children: CategoryTreeNode[]
}

export interface CategorySelectorItem {
  id: string
  name: string
  name_ar: string | null
  slug: string
  parent_id: string | null
}

export interface BatchCountResult {
  count: number
}

export interface CategoriesSummary {
  total: number
  active: number
  inactive: number
  root: number
  subcategories: number
}
