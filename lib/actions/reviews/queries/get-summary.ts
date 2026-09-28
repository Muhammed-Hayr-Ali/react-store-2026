

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReviewSummary } from "../types"

/**
 * جلب ملخص تقييمات منتج معين (المتوسط، العدد الإجمالي، توزيع النجوم)
 */
export async function getReviewSummary(
  productId: string
): Promise<ApiResult<ReviewSummary>> {
  // حماية: التأكد من صحة الـ ID
  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_ID_PROVIDED",
      details: { database: ["معرف المنتج مطلوب"] },
    }
  }

  const supabase = await createServerClient()

  // جلب فقط حقل rating للأداء الأمثل
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

  // إذا لم تكن هناك تقييمات، نرجع قيماً افتراضية
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

  // حساب المتوسط
  const sum = reviews!.reduce((acc, curr) => acc + curr.rating, 0)
  const averageRating = Math.round((sum / totalReviews) * 10) / 10

  // حساب توزيع النجوم
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
