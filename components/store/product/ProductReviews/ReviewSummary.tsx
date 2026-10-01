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
    <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-border/60 bg-card p-6 md:grid-cols-12 md:gap-12">
      {/* Average Score */}
      <div className="flex flex-col items-center justify-center text-center md:col-span-4  md:text-start">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl text-foreground">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </span>
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

        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          {totalReviews.toLocaleString()}{" "}
          {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 md:col-span-8">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as keyof typeof distribution] || 0
          const percentage = getPercentage(count)

          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span>{star}</span>
                <StarIcon className="size-3 fill-amber-400 text-amber-400" />
              </span>
              <Progress value={percentage} className="h-2 flex-1" />
              {/* <span className="w-10 text-end font-mono text-[11px] text-muted-foreground tabular-nums">
                {percentage}%
              </span> */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
