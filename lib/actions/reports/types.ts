/**
 * @file lib/actions/reports/types.ts
 * @description Pure TypeScript type definitions and contracts for reports.
 */

import { z } from "zod"
import {
  reportSchema,
  reportTargetTypeSchema,
  reportStatusSchema,
  createReportSchema,
  updateReportStatusSchema,
  resolveReportActionSchema,
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
export type ResolveReportActionInput = z.infer<typeof resolveReportActionSchema>
export type GetReportsFilterOptions = z.infer<typeof getReportsFilterSchema>

// ============================================================================
// Target Preview Interfaces
// ============================================================================

export interface ReviewTargetPreview {
  id: string
  rating: number
  comment: string | null
  product_id: string
  user_id: string
}

export interface ProductTargetPreview {
  id: string
  name: string
  slug: string
}

export type TargetPreview =
  | { type: "review"; data: ReviewTargetPreview }
  | { type: "product"; data: ProductTargetPreview }
  | null

// ============================================================================
// Extended Report Interface
// ============================================================================

export interface ReportWithDetails extends Report {
  reporter?: {
    id: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
  } | null
  target_preview?: TargetPreview
}
