/**
 * @file lib/actions/products/index.ts
 * @description Central export gateway for the products feature domain.
 * Exposes schemas, types, mutations, and query actions.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { createProduct } from "./mutations/create"
export { updateProduct } from "./mutations/update"
export { deleteProduct } from "./mutations/delete"
export { duplicateProduct } from "./mutations/duplicate"

// ============================================================================
// Queries
// ============================================================================
export { getAdminProductsList } from "./queries/get-admin-products"
export { getProductById } from "./queries/get-by-id"
export { getProductCompleteById } from "./queries/get-complete-by-id"
export { getProductCompleteBySlug } from "./queries/get-complete-by-slug"
export { getFeaturedProductSlides } from "./queries/get-featured-slides"
export { getLatestProducts } from "./queries/get-latest-products"
export { getProductsByBrand } from "./queries/get-products-by-brand"
export { getProductsByCategory } from "./queries/get-products-by-category"
