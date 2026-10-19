/**
 * @file lib/actions/categories/index.ts
 * @description Exposes the public category action API.
 */

// Mutations
export { createCategory } from "./mutations/create-category"
export { deleteCategory } from "./mutations/delete-category"
export { updateCategory } from "./mutations/update-category"

// Queries
export { getCategories } from "./queries/get-categories"
export { getCategoriesSummary } from "./queries/get-categories-summary"

// Types
export type {
  Category,
  CategoryInput,
  CategorySummary,
  CategoriesSummary,
} from "./types"
