"use client"

/**
 * @file components/store/product-details/reviews/star-rating.tsx
 * @description Read-only, accessible star rating with fractional fill and RTL support.
 */

import { useTranslations } from "next-intl"
import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  className?: string
  starClassName?: string
}

export function StarRating({
  rating,
  className,
  starClassName,
}: StarRatingProps) {
  const t = useTranslations("ProductReviews")
  const value = Math.min(5, Math.max(0, rating || 0))

  return (
    <div
      role="img"
      aria-label={t("RATING_ARIA", { rating: value })}
      className={cn("flex items-center gap-0.5", className)}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.min(1, Math.max(0, value - index)) * 100

        return (
          <span key={index} aria-hidden="true" className="relative inline-flex">
            <StarIcon
              className={cn("size-4 text-muted-foreground/30", starClassName)}
            />
            <span
              className="absolute inset-y-0 start-0 flex overflow-hidden"
              style={{ width: `${fill}%` }}
            >
              <StarIcon
                className={cn(
                  "size-4 shrink-0 fill-amber-400 text-amber-400",
                  starClassName
                )}
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}
