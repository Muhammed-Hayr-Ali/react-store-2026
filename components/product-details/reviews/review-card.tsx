/**
 * @file components/store/product-details/reviews/review-card.tsx
 * @description Single review card showing reviewer details, content, and distinct actions for owner vs admin.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { PencilIcon, Trash2Icon, ShieldAlertIcon } from "lucide-react"

import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DeleteReviewDialog } from "./delete-review-dialog"
import { ReviewDialog } from "./review-dialog"
import type { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { PERMISSIONS } from "@/lib/actions/role"

interface ReviewCardProps {
  review: ProductReviewItem
}

export function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations("ProductReviews")
  const { user, hasPermission } = useUser()

  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const ownerId = review.user_id ?? review.user?.id
  const isOwner = Boolean(user?.id && ownerId && user.id === ownerId)
  const canManage = hasPermission(PERMISSIONS.MANAGE_REVIEWS)
  
  const canModify = isOwner || canManage

  const reviewerName = review.user
    ? `${review.user.first_name || ""} ${review.user.last_name || ""}`.trim() ||
      t("ANONYMOUS_USER")
    : t("ANONYMOUS_USER")

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const fallbackInitials = getInitials(reviewerName)

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
    <div 
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${
        isOwner 
          ? "border-primary/40 bg-primary/2" 
          : canManage && !isOwner 
          ? "border-amber-500/30 bg-amber-500/1" 
          : "border-border bg-card hover:bg-muted/25"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-foreground">
                {reviewerName}
              </h5>
              {/* تمييز تعليق المستخدم الحالي */}
              {isOwner && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {t("YOU_BADGE") || "You"}
                </span>
              )}
              {/* شارة توضح أن المشرف يعرض تعليق لشخص آخر */}
              {!isOwner && canManage && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  <ShieldAlertIcon className="size-2.5" />
                  {t("ADMIN_VIEW_BADGE") || "Admin"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>

        {canModify && (
          <div className="flex items-center gap-1">
            <ReviewDialog
              review={review}
              mode="update"
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              onSuccess={() => setIsEditOpen(false)}
            >
              <Button
                variant={!isOwner && canManage ? "outline" : "secondary"}
                size="icon"
                className={`size-8 text-muted-foreground hover:text-foreground ${
                  !isOwner && canManage ? "border-amber-500/40 hover:border-amber-500" : ""
                }`}
                aria-label={t("EDIT_REVIEW_ARIA")}
                title={!isOwner && canManage ? "Admin Edit" : undefined}
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
                variant={!isOwner && canManage ? "outline" : "destructive"}
                size="icon"
                className={`size-8 text-muted-foreground hover:text-destructive ${
                  !isOwner && canManage ? "border-destructive/40 hover:border-destructive" : ""
                }`}
                aria-label={t("DELETE_REVIEW_ARIA")}
                title={!isOwner && canManage ? "Admin Delete" : undefined}
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