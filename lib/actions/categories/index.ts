/**
 * @file lib/actions/categories/index.ts
 * @description Central export gateway for the categories domain.
 * Exposes all types, Zod schemas, mutations, and queries.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { createCategory } from "./mutations/create"
export { updateCategory } from "./mutations/update"
export { deleteCategory } from "./mutations/delete"

// ============================================================================
// Queries
// ============================================================================
export { getAllCategories } from "./queries/get-all"
export { getCategoryById } from "./queries/get-by-id"
export { getCategoryBySlug } from "./queries/get-by-slug"
export { getRootCategories } from "./queries/get-root-categories"
