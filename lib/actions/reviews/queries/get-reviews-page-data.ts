/**
 * @file lib/actions/reviews/queries/get-reviews-page-data.ts
 * @description Loads review rows, summary statistics, and page-specific data for the reviews dashboard.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getReviews } from "./get-reviews"
import { getReviewsSummary } from "./get-reviews-summary"
import type { ReviewWithUser, ReviewsSummary } from "../types"

export interface ReviewsPageData {
  reviews: ReviewWithUser[]
  summary: ReviewsSummary
  isMobile: boolean
}

export async function getReviewsPageData(): Promise<
  ApiResult<ReviewsPageData>
> {
  // 1. جلب قائمة التعليقات (بما فيها المعلقة لغرض الإدارة)
  const reviewsResult = await getReviews({ includePending: true })
  if (!reviewsResult.success) {
    return {
      success: false,
      error: reviewsResult.error,
      details: reviewsResult.details,
    }
  }

  // 2. جلب الملخص والإحصائيات
  const summaryResult = await getReviewsSummary()
  if (!summaryResult.success) {
    return {
      success: false,
      error: summaryResult.error,
      details: summaryResult.details,
    }
  }

  const reviews = reviewsResult.data
  const summary = summaryResult.data

  // 3. التحقق من نوع الجهاز لتحسين تجربة المستخدم (Responsive UI)
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      reviews,
      summary,
      isMobile,
    },
  }
}