/**
 * @file lib/actions/products/index.ts
 * @description Central export gateway for the products feature domain.
 * Exposes schemas, types, mutations, and query actions.
 */

// Schemas & Types
export * from "./schemas"
export * from "./types"

// Mutations
export { createProduct } from "./mutations/create"
export { updateProduct } from "./mutations/update"
export { deleteProduct } from "./mutations/delete"
export { duplicateProduct } from "./mutations/duplicate"

// Queries
export { getAdminProductsList } from "./queries/get-admin-products-list"
export { getAdminProductsSummary } from "./queries/get-admin-products-summary"
export { getProductForEditBySlug } from "./queries/get-product-for-edit-by-slug"
