"use client"

import * as React from "react"
import {
  StarIcon,
  UserIcon,
  XIcon,
  User2Icon,
  PencilIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ReviewSummary, ReviewWithProfile } from "@/lib/actions/reviews/types"
import { createReview, updateReview, deleteReview } from "@/lib/actions/reviews"

// مكونات shadcn القياسية
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"

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
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // حالات نموذج التعديل
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editRating, setEditRating] = React.useState(0)
  const [editComment, setEditComment] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  const handleResetForm = () => {
    setIsFormOpen(false)
    setRating(0)
    setHoverRating(0)
    setComment("")
  }

  // --- دوال الإضافة ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createReview({
        product_id: productId,
        rating,
        comment,
      })
      if (result.success) {
        toast.success("Thank you! Your review has been submitted.")
        handleResetForm()
        router.refresh()
      } else {
        if (result.error === "UNAUTHORIZED_ACCESS") {
          toast.error("Please log in to leave a review.")
        } else if (result.error === "REVIEW_ALREADY_EXISTS") {
          toast.error("You have already reviewed this product.")
        } else {
          toast.error(
            result.details?.database?.[0] || "Failed to submit review."
          )
        }
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
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

  // --- دوال الحذف ---
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    )
      return

    setDeletingId(id)
    try {
      const result = await deleteReview(id)
      if (result.success) {
        toast.success("Review deleted successfully!")
        router.refresh()
      } else {
        toast.error("Failed to delete review.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
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

        {!isFormOpen && (
          <CustomButton variant="outline" onClick={() => setIsFormOpen(true)}>
            Write a Review
          </CustomButton>
        )}
      </div>

      <Separator />

      {/* نموذج كتابة التقييم */}
      {isFormOpen && (
        <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Write a Review
            </h3>
            <CustomButton
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleResetForm}
            >
              <XIcon className="size-4" />
            </CustomButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Rating:</span>
              <div dir="ltr" className="flex items-center rtl:flex-row-reverse">
                {[1, 2, 3, 4, 5].map((star) => (
                  <CustomButton
                    type="button"
                    key={star}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="hover:bg-transparent"
                  >
                    <StarIcon
                      className={`size-5 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </CustomButton>
                ))}
              </div>
            </div>

            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={6}
              placeholder="What did you like or dislike?"
              className="resize-none text-sm"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground tabular-nums">
                {comment.length} / 500
              </span>
              <div className="flex items-center gap-2">
                <CustomButton
                  variant="outline"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </CustomButton>
              </div>
            </div>
          </form>
        </div>
      )}

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
        {reviews.length === 0 && !isFormOpen ? (
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
                          <p className="text-sm leading-relaxed break-words text-foreground">
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
                            <button
                              onClick={() => handleStartEdit(review)}
                              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <PencilIcon className="size-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              disabled={deletingId === review.id}
                            >
                              {deletingId === review.id ? (
                                <Loader2Icon className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2Icon className="size-3.5" />
                              )}
                              Delete
                            </button>
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
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                          >
                            Cancel
                          </CustomButton>
                          <CustomButton
                            type="submit"
                            size="sm"
                            disabled={isUpdating}
                          >
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
  )
}
