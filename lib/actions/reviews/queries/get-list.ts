/**
 * @file lib/actions/reviews/queries/get-list.ts
 * @description Retrieves all reviews for a product merged with their respective author profile details.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReviewWithProfile } from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getProductReviewsList(
  productId: string
): Promise<ApiResult<ReviewWithProfile[]>> {
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

  // 1. Fetch reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (reviewsError) {
    return {
      success: false,
      error: "FETCH_REVIEWS_ERROR",
      details: { database: [reviewsError.message] },
    }
  }

  if (!reviews || reviews.length === 0) {
    return {
      success: true,
      data: [],
    }
  }

  // 2. Fetch author profiles
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id)))

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, profile_image")
    .in("id", userIds)

  if (profilesError) {
    console.error(
      "Warning: Failed to fetch reviewer profiles:",
      profilesError.message
    )
  }

  // 3. Map profiles to reviews
  const profilesMap = new Map((profiles || []).map((p) => [p.id, p]))

  const reviewsWithProfiles: ReviewWithProfile[] = reviews.map((review) => ({
    ...review,
    profile: profilesMap.get(review.user_id) || null,
  }))

  return {
    success: true,
    data: reviewsWithProfiles,
  }
}
