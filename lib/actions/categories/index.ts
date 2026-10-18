/**
 * @file lib/actions/categories/index.ts
 * @description Exposes the public category action API.
 */

export { createCategory } from "./mutations/create-category"
export { deleteCategory } from "./mutations/delete-category"
export { updateCategory } from "./mutations/update-category"
export { getCategories } from "./queries/get-categories"
export { getCategoriesSummary } from "./queries/get-categories-summary"
export type {
  Category,
  CategoryInput,
  CategorySummary,
  CategoriesSummary,
} from "./types"
