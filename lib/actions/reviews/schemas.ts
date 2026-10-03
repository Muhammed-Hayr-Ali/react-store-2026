/**
 * @file lib/actions/reviews/schemas.ts
 * @description Zod validation schemas for product customer reviews and ratings.
 */

import { z } from "zod"

// ============================================================================
// Base Review Schema
// ============================================================================

export const reviewSchema = z.object({
  id: z.string().uuid("INVALID_ID"),
  product_id: z.string().uuid("INVALID_PRODUCT_ID"),
  user_id: z.string().uuid("INVALID_USER_ID"),
  rating: z.number().int().min(1, "RATING_MIN_1").max(5, "RATING_MAX_5"),
  comment: z.string().max(500, "COMMENT_TOO_LONG").nullable(),
  created_at: z.string(),
})

// ============================================================================
// Mutation Schemas
// ============================================================================

export const createReviewSchema = z.object({
  product_id: z.string().uuid("INVALID_PRODUCT_ID"),
  rating: z.number().int().min(1, "RATING_MIN_1").max(5, "RATING_MAX_5"),
  comment: z
    .string()
    .trim()
    .max(500, "COMMENT_TOO_LONG")
    .optional()
    .or(z.literal("")),
})

export const updateReviewSchema = z.object({
  id: z.string().uuid("INVALID_ID"),
  rating: z
    .number()
    .int()
    .min(1, "RATING_MIN_1")
    .max(5, "RATING_MAX_5")
    .optional(),
  comment: z
    .string()
    .trim()
    .max(500, "COMMENT_TOO_LONG")
    .optional()
    .or(z.literal("")),
})
