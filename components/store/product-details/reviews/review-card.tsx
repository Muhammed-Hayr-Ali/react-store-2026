"use client"

/**
 * @file components/store/product-details/reviews/review-card.tsx
 * @description Single review card showing reviewer details, content, and owner actions via dialog triggers.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { DeleteReviewDialog } from "./delete-review-dialog"
import { ReviewDialog } from "./review-dialog"
import type { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

export interface ExtendedProductReviewItem extends ProductReviewItem {
  user_id?: string
}

interface ReviewCardProps {
  review: ExtendedProductReviewItem
  onReviewDeleted?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  onReviewDeleted,
}: ReviewCardProps) {
  const t = useTranslations("ProductReviews")
  const { user } = useUser()

  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const ownerId = review.user_id ?? review.user?.id
  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId)

  const reviewerName = review.user
    ? `${review.user.first_name || ""} ${review.user.last_name || ""}`.trim() ||
      t("ANONYMOUS_USER")
    : t("ANONYMOUS_USER")

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/25">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {review.user?.profile_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={review.user.profile_image}
              alt={reviewerName}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {reviewerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h5 className="text-sm font-semibold text-foreground">
              {reviewerName}
            </h5>
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* عرض أزرار التعديل والحذف فقط إذا كان المستخدم هو صاحب التعليق */}
        {isOwner && (
          <div className="flex items-center gap-1">
            {/* دايلوج التعديل المشترك */}
            <ReviewDialog
              review={review}
              mode="update"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              onSuccess={() => {
                setIsEditOpen(false)
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={t("EDIT_REVIEW_ARIA")}
              >
                <PencilIcon className="size-3.5" />
              </Button>
            </ReviewDialog>

            {/* دايلوج الحذف */}
            <DeleteReviewDialog
              review={review}
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
              onDeleted={(deletedId) => {
                onReviewDeleted?.(deletedId)
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={t("DELETE_REVIEW_ARIA")}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </DeleteReviewDialog>
          </div>
        )}
      </div>

      <div className="flex items-center text-xs text-amber-500">
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </div>

      {review.content && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {review.content}
        </p>
      )}
    </div>
  )
}