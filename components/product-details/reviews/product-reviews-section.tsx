"use client"

/**
 * @file components/store/product-details/reviews/product-reviews-section.tsx
 * @description Main container wrapping header, summary card, and reviews list, with a dedicated load-error state.
 */

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ReviewsHeader } from "./reviews-header"
import { ReviewsSummaryCard } from "./reviews-summary-card"
import { EmptyReviews } from "./empty-reviews"
import { ReviewCard } from "./review-card"

import type { ProductReviewsResult } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface ProductReviewsSectionProps {
  /** null يعني أن جلب البيانات فشل */
  reviewsData: ProductReviewsResult | null
}

export function ProductReviewsSection({
  reviewsData,
}: ProductReviewsSectionProps) {
  const t = useTranslations("ProductReviews")
  const router = useRouter()

  // لا نعرض "لا توجد تقييمات" عندما يكون السبب الحقيقي خطأ في الجلب
  if (!reviewsData) {
    return (
      <div
        role="alert"
        className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/30 p-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          {t("FETCH_REVIEWS_ERROR")}
        </p>
        <Button variant="outline" onClick={() => router.refresh()}>
          {t("RETRY_BUTTON")}
        </Button>
      </div>
    )
  }

  const { productId, currentUserId, hasUserReviewed, reviews, summary } =
    reviewsData

  return (
    <section className="space-y-6 pt-6">
      <ReviewsHeader
        productId={productId}
        currentUserId={currentUserId}
        hasUserReviewed={hasUserReviewed}
        totalReviews={summary.totalReviews}
      />

      {summary.totalReviews > 0 && <ReviewsSummaryCard summary={summary} />}

      {summary.totalReviews === 0 ? (
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
    </section>
  )
}
