/**
 * @file lib/actions/reports/schemas.ts
 * @description Zod validation schemas for user reports, issue moderation, and admin resolution.
 */

import { z } from "zod"

// ============================================================================
// Enums & Constants
// ============================================================================

export const reportTargetTypeSchema = z.enum([
  "product",
  "review",
  "technical_issue",
  "general",
])

export const reportStatusSchema = z.enum([
  "pending",
  "in_review",
  "resolved",
  "dismissed",
])

// ============================================================================
// Base Report Schema
// ============================================================================

export const reportSchema = z.object({
  id: z.string().uuid("INVALID_ID"),
  reporter_id: z.string().uuid("INVALID_REPORTER_ID").nullable().optional(),
  target_type: reportTargetTypeSchema,
  target_id: z.string().nullable().optional(),
  reason: z.string().min(3, "REASON_TOO_SHORT").max(100, "REASON_TOO_LONG"),
  details: z.string().max(1000, "DETAILS_TOO_LONG").nullable().optional(),
  contact_email: z.string().email("INVALID_EMAIL").nullable().optional(),
  status: reportStatusSchema,
  admin_notes: z
    .string()
    .max(1000, "ADMIN_NOTES_TOO_LONG")
    .nullable()
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// ============================================================================
// Mutation Schemas
// ============================================================================

export const createReportSchema = z.object({
  targetType: reportTargetTypeSchema,
  targetId: z.string().uuid("INVALID_TARGET_ID").optional().or(z.literal("")),
  reason: z
    .string()
    .trim()
    .min(3, "REASON_TOO_SHORT")
    .max(100, "REASON_TOO_LONG"),
  details: z
    .string()
    .trim()
    .max(1000, "DETAILS_TOO_LONG")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .email("INVALID_EMAIL")
    .optional()
    .or(z.literal("")),
})

export const updateReportStatusSchema = z.object({
  reportId: z.string().uuid("INVALID_REPORT_ID"),
  status: reportStatusSchema,
  adminNotes: z.string().trim().max(1000, "ADMIN_NOTES_TOO_LONG").optional(),
})

export const resolveReportActionSchema = z.object({
  reportId: z.string().uuid("INVALID_REPORT_ID"),
  action: z.enum(["dismiss", "delete_target"]),
  adminNotes: z.string().trim().max(1000, "ADMIN_NOTES_TOO_LONG").optional(),
})

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const getReportsFilterSchema = z.object({
  status: reportStatusSchema.optional(),
  targetType: reportTargetTypeSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
})
