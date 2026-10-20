/**
 * @file lib/actions/store/product-details/queries/get-product-reviews.ts
 * @description Retrieves approved product reviews along with reviewer profile details and rating summary statistics.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"

export interface ReviewerProfile {
  id: string
  first_name: string | null
  last_name: string | null
  profile_image: string | null
}

export interface ProductReviewItem {
  id: string
  rating: number
  content: string | null
  is_approved: boolean
  created_at: string
  user: ReviewerProfile | null
}

export interface RatingBreakdownItem {
  rating: number
  count: number
  percentage: number
}

export interface ProductReviewsSummary {
  averageRating: number
  totalReviews: number
  ratingBreakdown: RatingBreakdownItem[]
}

export interface ProductReviewsResult {
  reviews: ProductReviewItem[]
  summary: ProductReviewsSummary
}

interface DatabaseReviewQueryResult {
  id: string
  rating: number
  content: string | null
  is_approved: boolean
  created_at: string
  user: ReviewerProfile[] | ReviewerProfile | null
}

interface GetProductReviewsOptions {
  limit?: number
}

export async function getProductReviews(
  productId: string,
  options: GetProductReviewsOptions = {}
): Promise<ApiResult<ProductReviewsResult>> {
  const { limit = 0 } = options

  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_PRODUCT_ID",
      details: { database: ["Product ID is required."] },
    }
  }

  const supabase = await createServerClient()

  // جلب كافة التعليقات المعتمدة لحساب الملخص بدقة، مع تطبيق الـ limit للتعليقات المعروضة لاحقاً
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      `
      id,
      rating,
      content,
      is_approved,
      created_at,
      user:user_id (
        id,
        first_name,
        last_name,
        profile_image
      )
    `
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getProductReviews] Database query failed", {
      productId,
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_REVIEWS_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawReviews = (data ?? []) as unknown as DatabaseReviewQueryResult[]

  // 1. حساب إحصائيات الملخص (Summary)
  const totalReviews = rawReviews.length

  // تهيئة عدادات النجوم من 1 إلى 5
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sumRatings = 0

  rawReviews.forEach((review) => {
    const r = Math.round(review.rating)
    if (r >= 1 && r <= 5) {
      counts[r] = (counts[r] || 0) + 1
    }
    sumRatings += review.rating
  })

  const averageRating =
    totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0

  const ratingBreakdown: RatingBreakdownItem[] = [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star] || 0
    const percentage =
      totalReviews > 0 ? Number(((count / totalReviews) * 100).toFixed(1)) : 0
    return {
      rating: star,
      count,
      percentage,
    }
  })

  // 2. تنسيق قائمة التعليقات مع تطبيق الـ limit المطلوب للعرض
  const limitedRawReviews = limit > 0 ? rawReviews.slice(0, limit) : rawReviews

  const formattedReviews: ProductReviewItem[] = limitedRawReviews.map(
    (review) => {
      let reviewer: ReviewerProfile | null = null
      if (review.user) {
        reviewer = Array.isArray(review.user) ? review.user[0] : review.user
      }

      return {
        id: review.id,
        rating: review.rating,
        content: review.content,
        is_approved: review.is_approved,
        created_at: review.created_at,
        user: reviewer,
      }
    }
  )

  return {
    success: true,
    data: {
      reviews: formattedReviews,
      summary: {
        averageRating,
        totalReviews,
        ratingBreakdown,
      },
    },
  }
}
