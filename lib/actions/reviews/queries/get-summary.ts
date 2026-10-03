/**
 * @file lib/actions/reviews/queries/get-summary.ts
 * @description Calculates rating statistics and distribution counts for a given product.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReviewSummary } from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getReviewSummary(
  productId: string
): Promise<ApiResult<ReviewSummary>> {
  const idValidation = z
    .string()
    .uuid("INVALID_PRODUCT_ID")
    .safeParse(productId)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID_PROVIDED",
      details: { database: ["Valid product UUID is required."] },
    }
  }

  const supabase = await createServerClient()

  // 1. Fetch ratings only
  const { data: reviews, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)

  if (error) {
    return {
      success: false,
      error: "FETCH_REVIEWS_ERROR",
      details: { database: [error.message] },
    }
  }

  const totalReviews = reviews?.length || 0

  if (totalReviews === 0) {
    return {
      success: true,
      data: {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
    }
  }

  // 2. Compute average and rating breakdown
  const sum = reviews!.reduce((acc, curr) => acc + curr.rating, 0)
  const averageRating = Math.round((sum / totalReviews) * 10) / 10

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews!.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++
    }
  })

  return {
    success: true,
    data: {
      averageRating,
      totalReviews,
      distribution,
    },
  }
}
