"use client"

/**
 * @file components/store/product-details/reviews/product-reviews-section.tsx
 * @description Main container wrapping header, summary card, and reviews list.
 */

import * as React from "react"

import { ReviewsHeader } from "./reviews-header"
import { ReviewsSummaryCard } from "./reviews-summary-card"
import { EmptyReviews } from "./empty-reviews"
import { ReviewCard, type ExtendedProductReviewItem } from "./review-card"
import { ProductReviewsResult } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface ProductReviewsSectionProps {
  productId: string
  reviewsData: ProductReviewsResult | null
}

export function ProductReviewsSection({
  productId,
  reviewsData,
}: ProductReviewsSectionProps) {
  const summary = reviewsData?.summary ?? {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: 0,
      percentage: 0,
    })),
  }

  // استخدام النوع المدقق بدلاً من أي نوع مبهم
  const reviews: ExtendedProductReviewItem[] = reviewsData?.reviews ?? []

  return (
    <div className="space-y-6 pt-6">
      <ReviewsHeader
        totalReviews={summary.totalReviews}
        productId={productId}
      />
      <ReviewsSummaryCard summary={summary} />

      {reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
