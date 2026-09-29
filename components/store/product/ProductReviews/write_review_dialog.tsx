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
import { createReview, createReviewSchema } from "@/lib/actions/reviews"

interface ReviewDialogProps {
  productId: string
  openDialog: string | null
  onCancel: (open: boolean) => void
}

export function ReviewDialog({
  productId,
  openDialog,
  onCancel,
}: ReviewDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hoverRating, setHoverRating] = React.useState(0)

  const form = useForm<z.infer<typeof createReviewSchema>>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      product_id: productId,
      rating: 0,
      comment: "",
    },
  })

  async function onSubmit(data: z.infer<typeof createReviewSchema>) {
    if (data.rating === 0) {
      toast.error("Please select a star rating")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createReview(data)
      if (result.success) {
        toast.success("Thank you! Your review has been submitted.")
        form.reset()
        onCancel(false)
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

  return (
    <Dialog open={openDialog === "write"} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your thoughts and rating for this product with other
            customers.
          </DialogDescription>
        </DialogHeader>

        <form
          id="review-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 py-2"
        >
          <FieldGroup>
            {/* حقل تقييم النجوم */}
            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Your Rating</FieldLabel>
                  <div
                    dir="ltr"
                    className="mt-1.5 flex items-center gap-1.5 rtl:flex-row-reverse"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`Rate ${star} stars`}
                      >
                        <StarIcon
                          className={`size-7 transition-colors ${
                            star <= (hoverRating || field.value)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
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
                  <FieldLabel>Comment (Optional)</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      placeholder="What did you like or dislike about this product?"
                      rows={5}
                      className="min-h-28 resize-none text-sm"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="text-xs text-muted-foreground tabular-nums">
                        {(field.value || "").length}/500
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

        <DialogFooter className="gap-2 sm:gap-0">
          <CustomButton
            variant="outline"
            onClick={() => onCancel(false)}
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
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
