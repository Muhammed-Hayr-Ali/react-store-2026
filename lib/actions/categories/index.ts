/**
 * @file lib/actions/categories/index.ts
 * @description Central export gateway for the categories domain module.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations (State-Mutating Server Actions)
// ============================================================================
export { createCategory } from "./mutations/create"
export { updateCategory } from "./mutations/update"
export { deleteCategory } from "./mutations/delete"
export { toggleCategoryStatus } from "./mutations/toggle-status"
export { reorderCategories } from "./mutations/reorder"
export { deleteBatchCategories } from "./mutations/delete-batch"

// ============================================================================
// Queries (Read-Only Data Fetchers)
// ============================================================================
export { getAllCategories } from "./queries/get-all"
export { getCategoryById } from "./queries/get-by-id"
export { getCategoryBySlug } from "./queries/get-by-slug"
export { getRootCategories } from "./queries/get-root-categories"
export { getCategoryTree } from "./queries/get-tree"
export { getCategoriesSelector } from "./queries/get-selector"
export { getCategoriesSummary } from "./queries/get-summary"
