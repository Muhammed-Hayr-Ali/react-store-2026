"use client"

/**
 * @file components/store/product-details/reviews/reviews-header.tsx
 * @description Reviews section header with total count and write review button dialog.
 */


import * as React from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ReviewDialog } from "./review-dialog"

interface ReviewsHeaderProps {
  currentUserId: string | null | undefined
  hasUserReviewed: boolean | undefined
  productId: string | undefined
  totalReviews: number
}

export function ReviewsHeader({
  currentUserId,
  hasUserReviewed,
  productId,
  totalReviews,
}: ReviewsHeaderProps) {
  const t = useTranslations("ProductReviews")
  const [isOpen, setIsOpen] = React.useState(false)

  const canReview = currentUserId && !hasUserReviewed

  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {t("REVIEWS_SECTION_TITLE")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("VERIFIED_REVIEWS_COUNT", { count: totalReviews })}
        </p>
      </div>
      {canReview && (
        <ReviewDialog
          productId={productId}
          mode="create"
          open={isOpen}
          onOpenChange={setIsOpen}
          onSuccess={() => {
            setIsOpen(false)
          }}
        >
          <Button
            size="sm"
            className="text-xs"
            aria-label={t("WRITE_REVIEW_BUTTON")}
          >
            {t("WRITE_REVIEW_BUTTON")}
          </Button>
        </ReviewDialog>
      )}
    </div>
  )
}
