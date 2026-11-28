/**
 * @file components/store/product-details/reviews/review-card.tsx
 * @description Single review card showing reviewer details, content, and standard actions.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { StarRating } from "./star-rating"
import { DeleteReviewDialog } from "./delete-review-dialog"
import { ReviewDialog } from "./review-dialog"
import type { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { PERMISSIONS } from "@/lib/actions/role"

interface ReviewCardProps {
  review: ProductReviewItem
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  // Array.from يحافظ على الرموز المركبة من وحدتين (surrogate pairs)
  const letters =
    parts.length >= 2
      ? [Array.from(parts[0])[0], Array.from(parts[1])[0]]
      : Array.from(parts[0]).slice(0, 2)

  // الفاصل \u200C يمنع اتصال الحرفين العربيين ببعضهما
  return letters.join("\u200C").toUpperCase()
}

export function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations("ProductReviews")
  const { user, hasPermission } = useUser()

  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const ownerId = review.user_id ?? review.user?.id
  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId)
  const canModify = isOwner || hasPermission(PERMISSIONS.MANAGE_REVIEWS)

  const reviewerName =
    [review.user?.first_name, review.user?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || t("ANONYMOUS_USER")

  const getTimeAgo = () => {
    const diffInSeconds = Math.floor(
      (Date.now() - new Date(review.created_at).getTime()) / 1000
    )

    if (diffInSeconds < 60) return t("JUST_NOW")
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return t("MINUTES_AGO", { count: minutes })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t("HOURS_AGO", { count: hours })
    const days = Math.floor(hours / 24)
    if (days < 30) return t("DAYS_AGO", { count: days })
    // الأيام من 360 إلى 364 تبقى "11 شهراً" بدلاً من "0 سنة"
    if (days < 365) {
      return t("MONTHS_AGO", { count: Math.min(11, Math.floor(days / 30)) })
    }
    return t("YEARS_AGO", { count: Math.floor(days / 365) })
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/25">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage
              src={review.user?.avatar || undefined}
              alt={reviewerName}
            />
            <AvatarFallback className="text-xs">
              {getInitials(reviewerName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-foreground">
              <bdi>{reviewerName}</bdi>
            </h4>
            {/* الوقت النسبي قد يختلف بين الخادم والمتصفح */}
            <time
              dateTime={review.created_at}
              suppressHydrationWarning
              className="block text-xs text-muted-foreground"
            >
              {getTimeAgo()}
            </time>
          </div>
        </div>

        {canModify && (
          <div className="flex shrink-0 items-center gap-1">
            <ReviewDialog
              review={review}
              mode="update"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:text-foreground sm:size-8"
                aria-label={t("EDIT_REVIEW_ARIA")}
              >
                <PencilIcon aria-hidden="true" className="size-3.5" />
              </Button>
            </ReviewDialog>

            <DeleteReviewDialog
              review={review}
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:size-8"
                aria-label={t("DELETE_REVIEW_ARIA")}
              >
                <Trash2Icon aria-hidden="true" className="size-3.5" />
              </Button>
            </DeleteReviewDialog>
          </div>
        )}
      </div>

      <StarRating rating={review.rating} starClassName="size-3.5" />

      {review.content && (
        <p
          dir="auto"
          className="text-sm leading-relaxed break-words whitespace-pre-line text-muted-foreground"
        >
          {review.content}
        </p>
      )}
    </article>
  )
}
