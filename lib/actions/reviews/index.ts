/**
 * @file lib/actions/reviews/index.ts
 * @description Central export gateway for the reviews domain.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { createReview } from "./mutations/create"
export { updateReview } from "./mutations/update"
export { deleteReview } from "./mutations/delete"

// ============================================================================
// Queries
// ============================================================================
export { getProductReviewsList } from "./queries/get-list"
export { getReviewSummary } from "./queries/get-summary"
