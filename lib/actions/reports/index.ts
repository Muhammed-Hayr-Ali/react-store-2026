/**
 * @file lib/actions/reports/index.ts
 * @description Central export gateway for the reports domain.
 */

// ============================================================================
// Schemas & Types
// ============================================================================
export * from "./schemas"
export * from "./types"

// ============================================================================
// Mutations
// ============================================================================
export { submitReport } from "./mutations/create"
export { updateReportStatus } from "./mutations/update-status"
export { deleteReport } from "./mutations/delete"

// ============================================================================
// Queries
// ============================================================================
export { getAllReports } from "./queries/get-all"
export { getReportById } from "./queries/get-by-id"
