"use client"

import { StarIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ReviewSummary as ReviewSummaryType } from "@/lib/actions/reviews/types"

interface ReviewSummaryProps {
  summary: ReviewSummaryType
}

export function ReviewSummary({ summary }: ReviewSummaryProps) {
  const { averageRating, totalReviews, distribution } = summary

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className="grid grid-cols-1 items-center gap-8 py-2 md:grid-cols-12">
      {/* الجزء الأيسر: المتوسط والنجوم */}
      <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:text-start">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl tracking-tight text-foreground tabular-nums">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </span>
          <span className="text-sm text-muted-foreground">/ 5</span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`size-4 ${
                i < Math.round(averageRating)
                  ? "fill-current"
                  : "text-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          {totalReviews.toLocaleString()}{" "}
          {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* الجزء الأيمن: أشرطة التقدم مع تحسين الملصقات */}
      <div className="space-y-2 md:col-span-8">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as keyof typeof distribution] || 0
          const percentage = getPercentage(count)

          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="flex w-8 items-center gap-1 text-muted-foreground tabular-nums">
                <span>{star}</span>
                <StarIcon className="size-3 fill-amber-400 text-amber-400" />
              </span>
              <Progress value={percentage} className="h-1.5 flex-1" />
              <span className="w-9 text-end text-muted-foreground tabular-nums">
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
