/**
 * @file lib/actions/store/product-details/reviews/queries/get-product-reviews.ts
 * @description Retrieves approved product reviews along with reviewer profile details, rating summary statistics, and current user ownership status.
 */

import "server-only"

import { createServerClient } from "@/lib/database/supabase/server"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { Tables } from "@/lib/database/supabase/types"

export type ReviewerProfile = Pick<
  Tables<"profiles">,
  "id" | "first_name" | "last_name" | "avatar"
>

export type ProductReviewItem = Pick<
  Tables<"product_reviews">,
  "id" | "rating" | "content" | "is_approved" | "created_at" | "user_id"
> & {
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
  productId: string
  currentUserId: string | null | undefined
  hasUserReviewed: boolean | undefined
  reviews: ProductReviewItem[]
  summary: ProductReviewsSummary
}

interface GetProductReviewsOptions {
  /** Max number of reviews to return. 0 (default) means no explicit limit. */
  limit?: number
}

const STARS = [5, 4, 3, 2, 1] as const

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

  const currentUserResult = await getCurrentUser()
  const currentUserId =
    currentUserResult.success && currentUserResult.data
      ? currentUserResult.data.id
      : null

  let listQuery = supabase
    .from("product_reviews")
    .select(
      `
        id,
        rating,
        content,
        is_approved,
        created_at,
        user_id,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar
        )
      `
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  if (Number.isInteger(limit) && limit > 0) {
    listQuery = listQuery.limit(limit)
  }

  const [listResponse, starResponses, ownReviewResponse] = await Promise.all([
    listQuery,
    // عدّ كل فئة نجوم داخل قاعدة البيانات (دون جلب الصفوف) لتبقى الإحصائيات دقيقة مهما كثرت التقييمات
    Promise.all(
      STARS.map((star) =>
        supabase
          .from("product_reviews")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId)
          .eq("is_approved", true)
          .eq("rating", star)
      )
    ),
    // يشمل التقييمات غير المعتمدة بعد، لمنع إرسال تقييم ثانٍ
    currentUserId
      ? supabase
          .from("product_reviews")
          .select("id", { count: "exact", head: true })
          .eq("product_id", productId)
          .eq("user_id", currentUserId)
      : null,
  ])

  const error =
    listResponse.error ??
    starResponses.find((response) => response.error)?.error ??
    ownReviewResponse?.error

  if (error) {
    console.error("[getProductReviews] Database query failed", {
      productId,
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_REVIEWS_ERROR",
      // لا نمرّر رسالة قاعدة البيانات الداخلية إلى المستدعي
      details: { database: ["Failed to fetch reviews."] },
    }
  }

  const counts = STARS.map((star, index) => ({
    rating: star,
    count: starResponses[index]?.count ?? 0,
  }))

  const totalReviews = counts.reduce((sum, item) => sum + item.count, 0)
  const sumRatings = counts.reduce(
    (sum, item) => sum + item.rating * item.count,
    0
  )

  const averageRating =
    totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0

  const ratingBreakdown: RatingBreakdownItem[] = counts.map(
    ({ rating, count }) => ({
      rating,
      count,
      percentage:
        totalReviews > 0
          ? Number(((count / totalReviews) * 100).toFixed(1))
          : 0,
    })
  )

  const reviews: ProductReviewItem[] = listResponse.data ?? []

  return {
    success: true,
    data: {
      productId,
      currentUserId,
      hasUserReviewed: (ownReviewResponse?.count ?? 0) > 0,
      reviews,
      summary: { averageRating, totalReviews, ratingBreakdown },
    },
  }
}
