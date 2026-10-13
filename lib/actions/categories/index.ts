/**
 * @file lib/actions/categories/index.ts
 * @description Exposes the public category action API.
 */

export { createCategory } from "./mutations/create-category"
export { deleteCategory } from "./mutations/delete-category"
export { updateCategory } from "./mutations/update-category"
export { getCategories } from "./queries/get-categories"
export { getCategoryById } from "./queries/get-category-by-id"
export { getCategoryBySlug } from "./queries/get-category-by-slug"
export type { Category, CategoryInput, CategorySummary } from "./types"
