"use client"

/**
 * @file components/store/product-details/reviews/empty-reviews.tsx
 * @description Empty state component encouraging users to write the first review with integrated ReviewDialog.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { MessageSquareWarningIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReviewDialog } from "./review-dialog"

interface EmptyReviewsProps {
  productId: string
  currentUserId: string | null | undefined
  hasUserReviewed: boolean | undefined
 }

export function EmptyReviews({
  productId,
  currentUserId,
  hasUserReviewed,
 }: EmptyReviewsProps) {
  const t = useTranslations("ProductReviews")
  const [isOpen, setIsOpen] = React.useState(false)

  // إظهار زر كتابة التقييم فقط إذا كان المستخدم مسجلاً ولم يقم بتقييم المنتج مسبقاً
  const canReview = Boolean(currentUserId && !hasUserReviewed)

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MessageSquareWarningIcon className="size-6" />
      </div>
      <h4 className="font-semibold text-foreground">{t("NO_REVIEWS_TITLE")}</h4>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {t("NO_REVIEWS_DESCRIPTION")}
      </p>

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
            variant="outline"
            className="mt-4 text-xs"
            aria-label={t("WRITE_FIRST_REVIEW_BUTTON")}
          >
            {t("WRITE_FIRST_REVIEW_BUTTON")}
          </Button>
        </ReviewDialog>
      )}
    </div>
  )
}