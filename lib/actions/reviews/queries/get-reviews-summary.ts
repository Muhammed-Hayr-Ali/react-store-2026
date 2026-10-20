/**
 * @file lib/actions/reviews/queries/get-reviews-summary.ts
 * @description Retrieves aggregate counts for the reviews dashboard summary.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { ReviewsSummary } from "../types"

export async function getReviewsSummary(): Promise<
  ApiResult<ReviewsSummary>
> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .select("is_approved")

  if (error) {
    return {
      success: false,
      error: "GET_REVIEWS_ERROR",
      details: { database: [error.message] },
    }
  }

  const reviews = (data ?? []) as Array<{ is_approved: boolean }>
  const approved = reviews.filter((review) => review.is_approved).length

  return {
    success: true,
    data: {
      total: reviews.length,
      approved,
      pending: reviews.length - approved,
    },
  }
}