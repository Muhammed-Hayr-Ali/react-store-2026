"use client"

/**
 * @file components/store/product-details/reviews/reviews-header.tsx
 * @description Reviews section header with total count, review dialog, and already-reviewed appreciation message.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReviewDialog } from "./review-dialog"
import { PERMISSIONS } from "@/lib/actions/role"
import { Can } from "@/components/shared/can"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewsHeaderProps {
  currentUserId: string | null | undefined
  hasUserReviewed: boolean | undefined
  productId: string | undefined
  totalReviews: number
  onReviewCreated?: () => void
}

export function ReviewsHeader({
  currentUserId,
  hasUserReviewed,
  productId,
  totalReviews,
  onReviewCreated,
}: ReviewsHeaderProps) {
  const t = useTranslations("ProductReviews")
  const [isOpen, setIsOpen] = React.useState(false)

  const canReview = currentUserId && !hasUserReviewed

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {t("REVIEWS_SECTION_TITLE")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("VERIFIED_REVIEWS_COUNT", { count: totalReviews })}
        </p>
      </div>

      {hasUserReviewed && (
        <Alert className="w-full sm:w-fit">
          <CheckCircle2Icon />
          <AlertDescription>{t("ALREADY_REVIEWED_MESSAGE")}</AlertDescription>
        </Alert>
      )}

      {/* زر إضافة تقييم إذا استوفى الشروط والصلاحيات */}
      {canReview && productId && (
        <Can permission={PERMISSIONS.CREATE_REVIEW}>
          <ReviewDialog
            productId={productId}
            mode="create"
            open={isOpen}
            onOpenChange={setIsOpen}
            onSuccess={() => {
              setIsOpen(false)
              onReviewCreated?.()
            }}
          >
            <Button
              variant="outline"
              className="text-xs"
              aria-label={t("WRITE_REVIEW_BUTTON")}
            >
              {t("WRITE_REVIEW_BUTTON")}
            </Button>
          </ReviewDialog>
        </Can>
      )}
    </div>
  )
}
