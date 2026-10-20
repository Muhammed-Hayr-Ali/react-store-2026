"use client"

/**
 * @file components/store/product-details/reviews/reviews-summary-card.tsx
 * @description Summary card displaying average rating, total count, and star breakdown progress bars.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { ProductReviewsSummary } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

 
interface ReviewsSummaryCardProps {
  summary: ProductReviewsSummary
}

export function ReviewsSummaryCard({ summary }: ReviewsSummaryCardProps) {
  const t = useTranslations("ProductReviews")
  const { averageRating, totalReviews, ratingBreakdown } = summary

  return (
    <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-12 md:items-center">
      {/* القسم الأيسر: المتوسط العام وعدد المقيمين */}
      <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:border-r md:border-border md:pr-6">
        <span className="text-5xl font-extrabold tracking-tight text-foreground">
          {averageRating}
        </span>
        <div className="my-1 flex items-center text-amber-500">
          {"★".repeat(Math.round(averageRating))}
          {"☆".repeat(5 - Math.round(averageRating))}
        </div>
        <span className="text-xs text-muted-foreground">
          {t("BASED_ON_REVIEWS", { count: totalReviews })}
        </span>
      </div>

      {/* القسم الأيمن: أشرطة التقدم لكل نجمة */}
      <div className="space-y-2 md:col-span-8 md:pl-2">
        {ratingBreakdown.map((item) => (
          <div key={item.rating} className="flex items-center gap-3 text-xs">
            <span className="w-16 font-medium text-foreground">
              {t("STAR_LABEL", { count: item.rating })}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="w-10 text-right text-muted-foreground">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}