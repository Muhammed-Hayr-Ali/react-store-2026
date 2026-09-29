"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { StarIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as z from "zod"

import { CustomButton } from "@/components/ui/custom-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  createReview,
  updateReview,
  createReviewSchema,
  ReviewDialogName,
} from "@/lib/actions/reviews"
import { ReviewWithProfile } from "@/lib/actions/reviews/types"

interface ReviewDialogProps {
  productId: string
  openDialog: ReviewDialogName | null
  onOpenChange: (open: boolean) => void
  review?: ReviewWithProfile
}

export function ReviewDialog({
  productId,
  openDialog,
  onOpenChange,
  review,
}: ReviewDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hoverRating, setHoverRating] = React.useState(0)

  const isEditMode = openDialog === "edit-review"

  const form = useForm<z.infer<typeof createReviewSchema>>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      product_id: productId,
      rating: 0,
      comment: "",
    },
  })

  // ✅ ضمان مزامنة الـ productId الأساسي ودعم وضع التعديل
  React.useEffect(() => {
    if (openDialog === "edit-review" && review) {
      form.reset({
        product_id: review.product_id || productId,
        rating: review.rating,
        comment: review.comment || "",
      })
    } else if (openDialog === "create-review") {
      form.reset({
        product_id: productId,
        rating: 0,
        comment: "",
      })
    }
  }, [openDialog, review, productId, form])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      onOpenChange(false)
      form.reset({
        product_id: productId,
        rating: 0,
        comment: "",
      })
      setHoverRating(0)
    }
  }

  async function onSubmit(data: z.infer<typeof createReviewSchema>) {
    if (data.rating === 0) {
      toast.error("Please select a star rating")
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEditMode && review) {
        result = await updateReview({
          id: review.id,
          rating: data.rating,
          comment: data.comment,
        })
      } else {
        result = await createReview({
          ...data,
          product_id: productId, // ضمان إرسال معرّف المنتج الحالي دائماً
        })
      }

      if (result.success) {
        toast.success(
          isEditMode
            ? "Review updated successfully!"
            : "Thank you! Your review has been submitted."
        )
        handleOpenChange(false)
        router.refresh()
      } else {
        if (result.error === "UNAUTHORIZED_ACCESS") {
          toast.error("Please log in to leave a review.")
        } else if (result.error === "REVIEW_ALREADY_EXISTS" && !isEditMode) {
          toast.error("You have already reviewed this product.")
        } else {
          toast.error(result.details?.database?.[0] || "Operation failed.")
        }
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={openDialog === "create-review" || openDialog === "edit-review"}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your rating and comments for this product."
              : "Share your experience with this product. Your feedback helps other customers make informed decisions."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="review-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FieldGroup>
            {/* حقل تقييم النجوم مع تحسين A11y */}
            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Your Rating</FieldLabel>
                  <div
                    dir="ltr"
                    className="mt-1.5 flex items-center gap-0.5 rtl:flex-row-reverse"
                    role="radiogroup"
                    aria-label="Product rating"
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentActiveRating = hoverRating || field.value
                      const isSelected = star === field.value

                      return (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            field.onChange(star)
                            setHoverRating(star)
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(field.value)}
                          className="rounded-sm p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <StarIcon
                            className={`size-7 transition-colors ${
                              star <= currentActiveRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/25"
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* حقل التعليق */}
            <Controller
              name="comment"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Comment</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      placeholder="What did you like or dislike about this product?"
                      rows={5}
                      className="min-h-24 resize-none text-sm"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="text-xs text-muted-foreground tabular-nums">
                        {(field.value || "").length} / 500
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <CustomButton
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form="review-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {isEditMode ? "Saving..." : "Submitting..."}
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Submit Review"
            )}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
