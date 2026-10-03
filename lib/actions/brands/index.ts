/**
 * @file lib/actions/brands/index.ts
 * @description Central export gateway for the brands feature domain.
 * Exposes all types, validation schemas, mutations, and queries.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { createBrand } from "./mutations/create"
export { updateBrand } from "./mutations/update"
export { deleteBrand } from "./mutations/delete"

// ============================================================================
// Queries
// ============================================================================
export { getAllBrands, getAllBrand } from "./queries/get-all"
export { getBrandById } from "./queries/get-by-id"
export { getBrandBySlug } from "./queries/get-by-slug"
