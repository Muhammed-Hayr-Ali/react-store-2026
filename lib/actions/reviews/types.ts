/**
 * @file lib/actions/reviews/types.ts
 * @description Pure TypeScript type contracts and UI interfaces for customer reviews.
 */

import { z } from "zod"
import { reviewSchema, createReviewSchema, updateReviewSchema } from "./schemas"

// ============================================================================
// Inferred Types
// ============================================================================

export type Review = z.infer<typeof reviewSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

// ============================================================================
// Query & Presentation Types
// ============================================================================

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface ReviewWithProfile {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profile: {
    first_name: string | null
    last_name: string | null
    profile_image: string | null
  } | null
}

export type ReviewDialogName = "create-review" | "edit-review" | "delete-review"
