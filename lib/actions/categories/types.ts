/**
 * @file lib/actions/categories/types.ts
 * @description Inferred TypeScript types and presentation models for the Categories domain.
 */

import { z } from "zod"
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryStatusSchema,
  getCategoriesFilterSchema,
  reorderCategoriesSchema,
  deleteBatchCategoriesSchema,
} from "./schemas"

// Re-export or define ApiResult contract
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

// Entity Types
export type Category = z.infer<typeof categorySchema>
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

// Presentation & Relational Models
export interface CategoryWithParent extends Category {
  parent?: {
    id: string
    name: string
    name_ar: string | null
    slug: string
  } | null
}

export interface CategoryTreeNode extends Category {
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
