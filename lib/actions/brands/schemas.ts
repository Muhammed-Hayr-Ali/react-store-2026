/**
 * @file lib/actions/brands/schemas.ts
 * @description Zod validation schemas for Brand entities.
 * Enforces data contracts for input sanitization, mutation payloads, and database output verification.
 */

import { z } from "zod"

// ============================================================================
// Base Brand Schema
// ============================================================================

export const brandSchema = z.object({
  id: z.string().uuid("INVALID_ID"),
  name: z.string().min(1, "NAME_REQUIRED").max(100, "NAME_TOO_LONG"),
  name_ar: z.string().max(100, "NAME_TOO_LONG").nullable().or(z.literal("")),
  slug: z
    .string()
    .min(1, "SLUG_REQUIRED")
    .regex(/^[a-z0-9-]+$/, "SLUG_INVALID_FORMAT"),
  logo_url: z.string().url("INVALID_URL").nullable().or(z.literal("")),
  logo_alt: z
    .string()
    .max(200, "ALT_TEXT_TOO_LONG")
    .nullable()
    .or(z.literal("")),
  created_at: z.string(),
  updated_at: z.string(),
})

// ============================================================================
// Mutation Schemas
// ============================================================================

export const createBrandSchema = brandSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateBrandSchema = brandSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
