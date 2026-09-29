"use client"

import * as React from "react"
import {
  StarIcon,
  UserIcon,
  User2Icon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import {
  ReviewDialogName,
  ReviewSummary,
  ReviewWithProfile,
} from "@/lib/actions/reviews/types"

// مكونات shadcn القياسية
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { ReviewDialog } from "./write_review_dialog"
import { DeleteReviewDialog } from "./delete_review_dialog"


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
        <div className="space-y-6">
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
              const fullName =
                [review.profile?.first_name, review.profile?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Verified Customer"

              return (
                <React.Fragment key={review.id}>
                  {idx > 0 && <Separator />}

                  <article className="flex flex-col gap-4 py-2 sm:flex-row sm:items-start sm:gap-6">
                    {/* الجزء الأيسر: الصورة، الاسم، التاريخ، والنجوم */}
                    <div className="flex shrink-0 flex-col items-start justify-start gap-2 sm:w-52">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={review.profile?.profile_image || undefined}
                          />
                          <AvatarFallback className="p-2">
                            <User2Icon className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {fullName}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div
                          dir="ltr"
                          className="flex items-center gap-0.5 text-amber-400"
                        >
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`size-3.5 ${
                                i < review.rating
                                  ? "fill-current"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <time className="text-xs text-muted-foreground tabular-nums">
                          {new Date(review.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </time>
                      </div>
                    </div>

                    {/* الجزء الأيمن: التعليق وأزرار التحكم */}
                    <div className="flex flex-1 flex-col gap-2">
                      {review.comment?.trim() ? (
                        <p className="text-sm leading-relaxed wrap-break-word text-foreground">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          (No review text provided)
                        </p>
                      )}

                      {/* ✅ أزرار التحكم (فقط للمالك) */}
                      {isOwner && (
                        <div className="mt-1 flex items-center justify-end gap-2">
                          <CustomButton
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              setDialogState({
                                id: review.id,
                                openDialog: "edit-review",
                              })
                            }
                          >
                            <PencilIcon className="size-4" />
                          </CustomButton>
                          <CustomButton
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            onClick={() =>
                              setDialogState({
                                id: review.id,
                                openDialog: "delete-review",
                              })
                            }
                          >
                            <Trash2Icon className="size-4" />
                          </CustomButton>
                        </div>
                      )}
                    </div>
                  </article>
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
        review={reviews.find((r) => r.id === dialogState.id)} // ✅ تمرير بيانات التقييم للتعديل
      />

      <DeleteReviewDialog
        id={dialogState.id}
        openDialog={dialogState.openDialog}
        onOpenChange={handleOnOpenChange}
      />
    </>
  )
}
