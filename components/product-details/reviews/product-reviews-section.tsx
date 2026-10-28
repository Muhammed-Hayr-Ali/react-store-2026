"use client"

/**
 * @file components/store/product-details/reviews/product-reviews-section.tsx
 * @description Main container wrapping header, summary card, and reviews list with the new data structure.
 */

import { ReviewsHeader } from "./reviews-header"
import { ReviewsSummaryCard } from "./reviews-summary-card"
import { EmptyReviews } from "./empty-reviews"
import { ReviewCard } from "./review-card"

import type {
  ProductReviewItem,
  ProductReviewsResult,
} from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface ProductReviewsSectionProps {
  reviewsData: ProductReviewsResult | null
}

export function ProductReviewsSection({
  reviewsData,
}: ProductReviewsSectionProps) {
  const productId = reviewsData?.productId ?? ""
  const currentUserId = reviewsData?.currentUserId ?? null
  const hasUserReviewed = reviewsData?.hasUserReviewed ?? false

  const summary = reviewsData?.summary ?? {
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: [5, 4, 3, 2, 1].map((r) => ({
      rating: r,
      count: 0,
      percentage: 0,
    })),
  }

  const reviews: ProductReviewItem[] = reviewsData?.reviews ?? []

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <ReviewsHeader
        productId={productId}
        currentUserId={currentUserId}
        hasUserReviewed={hasUserReviewed}
        totalReviews={summary.totalReviews}
      />

      <ReviewsSummaryCard summary={summary} />

      {reviews.length === 0 ? (
        <EmptyReviews
          productId={productId}
          currentUserId={currentUserId}
          hasUserReviewed={hasUserReviewed}
        />
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
