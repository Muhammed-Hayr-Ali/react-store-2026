"use client"

/**
 * @file components/store/product-details/reviews/review-card.tsx
 * @description Single review card showing reviewer details, content, and owner actions with two-letter avatar initials.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { PencilIcon, Trash2Icon } from "lucide-react"

import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DeleteReviewDialog } from "./delete-review-dialog"
import { ReviewDialog } from "./review-dialog"
import type { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"

interface ReviewCardProps {
  review: ProductReviewItem
}

export function ReviewCard({ review }: ReviewCardProps) {
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

  // استخراج الحرفين الأولين بشكل مباشر بدون useMemo لتوافق تام مع React Compiler
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const fallbackInitials = getInitials(reviewerName)

  // حساب الوقت النسبي (منذ يومين، منذ ساعة، الخ)
  const timeAgo = React.useMemo(() => {
    const now = new Date().getTime()
    const reviewTime = new Date(review.created_at).getTime()
    const diffInSeconds = Math.floor((now - reviewTime) / 1000)

    if (diffInSeconds < 60) return t("JUST_NOW")

    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return t("MINUTES_AGO", { count: minutes })

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t("HOURS_AGO", { count: hours })

    const days = Math.floor(hours / 24)
    if (days < 30) return t("DAYS_AGO", { count: days })

    const months = Math.floor(days / 30)
    if (months < 12) return t("MONTHS_AGO", { count: months })

    const years = Math.floor(months / 12)
    return t("YEARS_AGO", { count: years })
  }, [review.created_at, t])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/25">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* استخدام مكون Avatar الاحترافي مع الحرفين */}
          <Avatar className="size-9">
            <AvatarImage
              src={review.user?.profile_image || undefined}
              alt={reviewerName}
            />
            <AvatarFallback className="text-xs">
              {fallbackInitials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h5 className="text-sm font-semibold text-foreground">
              {reviewerName}
            </h5>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>

        {/* عرض أزرار التعديل والحذف فقط إذا كان المستخدم هو صاحب التعليق */}
        {isOwner && (
          <div className="flex items-center gap-1">
            <ReviewDialog
              review={review}
              mode="update"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              onSuccess={() => setIsEditOpen(false)}
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

            <DeleteReviewDialog
              review={review}
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
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
        <Can permission={PERMISSIONS.MANAGE_REVIEWS}>
          {!isOwner && (
            <div className="flex items-center gap-1">
              <ReviewDialog
                review={review}
                mode="update"
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={() => setIsEditOpen(false)}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label={t("EDIT_REVIEW_ARIA")}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
              </ReviewDialog>

              <DeleteReviewDialog
                review={review}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label={t("DELETE_REVIEW_ARIA")}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </DeleteReviewDialog>
            </div>
          )}
        </Can>
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
