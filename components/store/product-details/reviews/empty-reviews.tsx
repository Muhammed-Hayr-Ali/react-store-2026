"use client"

/**
 * @file components/store/product-details/reviews/empty-reviews.tsx
 * @description Empty state component encouraging users to write the first review.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { MessageSquareWarningIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EmptyReviewsProps {
  onAddReview?: () => void
}

export function EmptyReviews({ onAddReview }: EmptyReviewsProps) {
  const t = useTranslations("ProductReviews")

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <MessageSquareWarningIcon className="size-6" />
      </div>
      <h4 className="font-semibold text-foreground">{t("NO_REVIEWS_TITLE")}</h4>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {t("NO_REVIEWS_DESCRIPTION")}
      </p>
      <Button onClick={onAddReview} variant="outline" size="sm" className="mt-4 text-xs">
        {t("WRITE_FIRST_REVIEW_BUTTON")}
      </Button>
    </div>
  )
}