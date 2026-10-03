/**
 * @file lib/actions/reports/types.ts
 * @description Pure TypeScript type contracts and interfaces for reports.
 */

import { z } from "zod"
import {
  reportSchema,
  reportTargetTypeSchema,
  reportStatusSchema,
  createReportSchema,
  updateReportStatusSchema,
  getReportsFilterSchema,
} from "./schemas"

// ============================================================================
// Inferred Types
// ============================================================================

export type ReportTargetType = z.infer<typeof reportTargetTypeSchema>
export type ReportStatus = z.infer<typeof reportStatusSchema>
export type Report = z.infer<typeof reportSchema>

export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>
export type GetReportsFilterOptions = z.infer<typeof getReportsFilterSchema>

// ============================================================================
// Extended Query Result Types
// ============================================================================

export interface ReportWithDetails extends Report {
  reporter?: {
    id: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
  } | null
  resolver?: {
    id: string
    first_name?: string | null
    last_name?: string | null
  } | null
}
