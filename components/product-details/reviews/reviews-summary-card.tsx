"use client"

/**
 * @file components/store/product-details/reviews/reviews-summary-card.tsx
 * @description Summary card displaying average rating, total count, and star breakdown progress bars side-by-side on all screen sizes.
 */

import { useTranslations } from "next-intl"
import { StarIcon } from "lucide-react"
import type { ProductReviewsSummary } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "./star-rating"

interface ReviewsSummaryCardProps {
  summary: ProductReviewsSummary
}

export function ReviewsSummaryCard({ summary }: ReviewsSummaryCardProps) {
  const t = useTranslations("ProductReviews")
  const { averageRating, totalReviews, ratingBreakdown } = summary

  return (
    <div className="grid grid-cols-12 items-center gap-4 rounded-2xl border border-border bg-card p-3 sm:p-4">
      {/* القسم الأيسر: المتوسط العام (يأخذ 4 أعمدة من أصل 12 أي ما يعادل ~33.3%) */}
      <div className="col-span-4 flex flex-col items-center justify-center border-e border-border pe-2 text-center">
        <span className="text-5xl tracking-tight text-foreground sm:text-7xl">
          {Number(averageRating).toFixed(1)}
        </span>
        <StarRating
          rating={averageRating}
          className="my-1"
          starClassName="size-3.5 sm:size-4"
        />
        <span className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
          {t("BASED_ON_REVIEWS", { count: totalReviews })}
        </span>
      </div>

      {/* القسم الأيمن: أشرطة التقدم (يأخذ 8 أعمدة المتبقية أي ما يعادل ~66.7%) */}
      <div className="col-span-8 space-y-2 ps-1">
        {ratingBreakdown.map((item) => (
          <div
            key={item.rating}
            className="flex items-center gap-2 text-xs sm:gap-3"
          >
            <div className="flex w-8 shrink-0 items-center gap-1 font-normal text-foreground sm:w-10">
              <span>{item.rating}</span>
              <StarIcon
                aria-hidden="true"
                className="size-3 fill-amber-500 text-amber-500"
              />
            </div>

            <Progress
              value={item.percentage}
              aria-label={t("RATING_BAR_ARIA", {
                rating: item.rating,
                count: item.count,
              })}
              className="h-1.5 flex-1 bg-muted sm:h-2 [&>div]:bg-amber-500 rtl:rotate-180"
            />

            <span
              aria-hidden="true"
              className="w-8 shrink-0 text-end text-muted-foreground tabular-nums"
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
