"use client"

/**
 * @file components/store/product-details/reviews/reviews-summary-card.tsx
 * @description Summary card displaying average rating, total count, and star breakdown progress bars side-by-side on all screen sizes.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { ProductReviewsSummary } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { Progress } from "@/components/ui/progress"

interface ReviewsSummaryCardProps {
  summary: ProductReviewsSummary
}

export function ReviewsSummaryCard({ summary }: ReviewsSummaryCardProps) {
  const t = useTranslations("ProductReviews")
  const { averageRating, totalReviews, ratingBreakdown } = summary

  return (
    <div className="grid grid-cols-12 items-center gap-4 rounded-2xl border border-border bg-card p-3 sm:p-4">
      {/* القسم الأيسر: المتوسط العام (يأخذ 4 أعمدة من أصل 12 أي ما يعادل ~33.3%) */}
      <div className="col-span-4 flex flex-col items-center justify-center ltr:border-r rtl:border-l border-border  text-center ">
        <span className="text-5xl tracking-tight text-foreground sm:text-7xl">
          {Number(averageRating).toFixed(1)}
        </span>
        <div className=" flex items-center text-sm text-amber-500 sm:text-base">
          {"★".repeat(Math.round(averageRating))}
          {"☆".repeat(5 - Math.round(averageRating))}
        </div>
        <span className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
          {t("BASED_ON_REVIEWS", { count: totalReviews })}
        </span>
      </div>

      {/* القسم الأيمن: أشرطة التقدم (يأخذ 8 أعمدة المتبقية أي ما يعادل ~66.7%) */}
      <div className="col-span-8 space-y-2 pl-2">
        {ratingBreakdown.map((item) => (
          <div
            key={item.rating}
            className="flex items-center gap-2 text-xs sm:gap-3"
          >
            <div className="flex w-8 shrink-0 items-center gap-1 font-normal text-foreground sm:w-10">
              <span>{item.rating}</span>
              <span className="text-base leading-none text-amber-500">★</span>
            </div>

            <Progress
              value={item.percentage}
              className="h-1.5 flex-1 bg-muted sm:h-2 [&>div]:bg-amber-500 rtl:rotate-180"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
