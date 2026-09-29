"use client"

import * as React from "react"
import {
  StarIcon,
  UserIcon,
  User2Icon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ReviewSummary, ReviewWithProfile } from "@/lib/actions/reviews/types"
import {  updateReview } from "@/lib/actions/reviews"

// مكونات shadcn القياسية
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { DeleteReviewDialog } from "./delete_review_dialog"
import { ReviewDialog } from "./write_review_dialog"

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
  const router = useRouter()
  const { averageRating, totalReviews, distribution } = summary

  // حالات نموذج الإضافة

  // حالات نموذج التعديل
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editRating, setEditRating] = React.useState(0)
  const [editComment, setEditComment] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)

  const [dialogState, setDialogState] = React.useState<{
    id: string | null
    isOpen: string | null
    onOpenChange?: (open: boolean) => void
  }>({
    id: null,
    isOpen: null,
    onOpenChange: () => {},
  })

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setDialogState({
        id: null,
        isOpen: null,
        onOpenChange: () => {},
      })
    }
  }

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  // --- دوال التعديل ---
  const handleStartEdit = (review: ReviewWithProfile) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment || "")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRating(0)
    setEditComment("")
  }

  const handleUpdateSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (editRating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsUpdating(true)
    try {
      const result = await updateReview({
        id,
        rating: editRating,
        comment: editComment,
      })
      if (result.success) {
        toast.success("Review updated successfully!")
        handleCancelEdit()
        router.refresh()
      } else {
        toast.error(result.details?.database?.[0] || "Failed to update review.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsUpdating(false)
    }
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
            onClick={() => setDialogState({ id: null, isOpen: "write" })}
          >
            Write a Review
          </CustomButton>
        </div>

        <Separator />

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
              const isEditing = editingId === review.id

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
                      {/* ✅ وضع العرض العادي */}
                      {!isEditing ? (
                        <>
                          {review.comment?.trim() ? (
                            <p className="text-sm leading-relaxed wrap-break-word text-foreground">
                              {review.comment}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              (No review text provided)
                            </p>
                          )}

                          {/* ✅ أزرار التحكم في أسفل التعليق ومحاذاة لليمين (فقط للمالك) */}
                          {isOwner && (
                            <div className="mt-1 flex items-center justify-end gap-2">
                              <CustomButton
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() => handleStartEdit(review)}
                              >
                                <PencilIcon />
                              </CustomButton>
                              <CustomButton
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() =>
                                  setDialogState({
                                    id: review.id,
                                    isOpen: "deleteReview",
                                  })
                                }
                              >
                                <Trash2Icon />
                              </CustomButton>
                            </div>
                          )}
                        </>
                      ) : (
                        /* ✅ وضع التعديل المدمج (Inline Edit) */
                        <form
                          onSubmit={(e) => handleUpdateSubmit(e, review.id)}
                          className="space-y-3 rounded-lg border bg-muted/10 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Update Rating:
                            </span>
                            <div dir="ltr" className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className="p-0.5 transition-transform hover:scale-110"
                                >
                                  <StarIcon
                                    className={`size-4 ${
                                      star <= editRating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <Textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Update your thoughts..."
                            className="resize-none text-sm"
                          />

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <CustomButton
                              type="button"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                            >
                              Cancel
                            </CustomButton>
                            <CustomButton type="submit" disabled={isUpdating}>
                              {isUpdating ? (
                                <>
                                  <Loader2Icon className="mr-2 size-3 animate-spin" />{" "}
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </CustomButton>
                          </div>
                        </form>
                      )}
                    </div>
                  </article>
                </React.Fragment>
              )
            })
          )}
        </div>
      </section>
      <ReviewDialog
        productId={productId}
        openDialog={dialogState.isOpen}
        onCancel={handleOnOpenChange}
      />
      <DeleteReviewDialog
        id={dialogState.id}
        isOpen={dialogState.isOpen}
        onOpenChange={handleOnOpenChange}
      />
    </>
  )
}
