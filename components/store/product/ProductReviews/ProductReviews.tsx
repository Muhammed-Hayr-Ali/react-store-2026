"use client"

import * as React from "react"
import { StarIcon, UserIcon } from "lucide-react"
import {
  ReviewDialogName,
  ReviewSummary,
  ReviewWithProfile,
} from "@/lib/actions/reviews/types"

// مكونات shadcn القياسية
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CustomButton } from "@/components/ui/custom-button"

// المكونات الفرعية
import { ReviewItem } from "@/components/store/product/ProductReviews/ReviewItem"
import { ReviewDialog } from "@/components/store/product/ProductReviews/ReviewDialog"
import { DeleteReviewDialog } from "@/components/store/product/ProductReviews/DeleteReviewDialog"

interface ProductReviewsProps {
  summary: ReviewSummary
  reviews: ReviewWithProfile[]
  productId: string
  currentUserId?: string
}

export default function ProductReviews({
  summary,
  reviews,
  productId,
  currentUserId,
}: ProductReviewsProps) {
  const { averageRating, totalReviews, distribution } = summary

  // ✅ حالة موحدة لإدارة جميع الحوارات
  const [dialogState, setDialogState] = React.useState<{
    id: string | null
    openDialog: ReviewDialogName | null
  }>({
    id: null,
    openDialog: null,
  })

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setDialogState({ id: null, openDialog: null })
    }
  }

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <>
      <section className="mt-12 space-y-8">
        {/* رأس القسم */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Customer Reviews
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Real feedback from verified purchasers
            </p>
          </div>

          <CustomButton
            variant="outline"
            onClick={() =>
              setDialogState({ id: null, openDialog: "create-review" })
            }
          >
            Write a Review
          </CustomButton>
        </div>

        <Separator />

        {/* الملخص الإحصائي */}
        <div className="grid grid-cols-1 items-center gap-8 py-2 md:grid-cols-12">
          <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:text-start">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl tracking-tight text-foreground tabular-nums">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
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

            <p className="mt-2 text-xs text-muted-foreground">
              {totalReviews.toLocaleString()}{" "}
              {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="space-y-2 md:col-span-8">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star as keyof typeof distribution] || 0
              const percentage = getPercentage(count)

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="flex w-4 items-center justify-between text-muted-foreground tabular-nums">
                    {star}
                  </span>
                  <Progress value={percentage} className="h-1.5 flex-1" />
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* قائمة المراجعات */}
        <div className="space-y-2">
          {reviews.length === 0 ? (
            <div className="py-12 text-center">
              <UserIcon className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No reviews yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            reviews.map((review, idx) => {
              const isOwner = review.user_id === currentUserId

              return (
                <React.Fragment key={review.id}>
                  {idx > 0 && <Separator />}

                  {/* ✅ استخدام المكون المنفصل */}
                  <ReviewItem
                    review={review}
                    isOwner={isOwner}
                    onEdit={() =>
                      setDialogState({
                        id: review.id,
                        openDialog: "edit-review",
                      })
                    }
                    onDelete={() =>
                      setDialogState({
                        id: review.id,
                        openDialog: "delete-review",
                      })
                    }
                  />
                </React.Fragment>
              )
            })
          )}
        </div>
      </section>

      {/* ✅ إدارة الحوارات في مكان واحد */}
      <ReviewDialog
        productId={productId}
        openDialog={dialogState.openDialog}
        onOpenChange={handleOnOpenChange}
        review={reviews.find((r) => r.id === dialogState.id)}
      />

      <DeleteReviewDialog
        id={dialogState.id}
        openDialog={dialogState.openDialog}
        onOpenChange={handleOnOpenChange}
      />
    </>
  )
}
