/**
 * @file lib/actions/flash-sales/index.ts
 * @description Central export gateway for the flash sales feature domain.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { createFlashSale } from "./mutations/create"
export { updateFlashSale } from "./mutations/update"
export { deleteFlashSale } from "./mutations/delete"
export { toggleFlashSaleStatus } from "./mutations/toggle-status"

// ============================================================================
// Queries
// ============================================================================
export { getActiveFlashSale } from "./queries/get-active-flash-sale"
export { getAllFlashSales } from "./queries/get-all-flash-sales"
export { getAvailableProducts } from "./queries/get-available-products"
export { getFlashSaleBySlug } from "./queries/get-flash-sale-by-slug"
export { getFlashSaleForEdit } from "./queries/get-flash-sale-for-edit"
