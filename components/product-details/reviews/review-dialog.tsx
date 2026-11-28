"use client"

/**
 * @file components/store/product-details/reviews/review-dialog.tsx
 * @description Shared dialog/bottom-sheet component for creating or updating a product review with an interactive star rating bar.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { StarIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { createReview } from "@/lib/actions/store/product-details/reviews/mutations/create-review"
import { updateReview } from "@/lib/actions/store/product-details/reviews/mutations/update-review"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface ReviewDialogProps {
  productId?: string
  review?: ProductReviewItem | null
  mode: "create" | "update"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  children?: React.ReactNode
}

interface ReviewFormValues {
  rating: number
  content: string
}

export function ReviewDialog({
  productId,
  review,
  mode,
  open,
  onOpenChange,
  onSuccess,
  children,
}: ReviewDialogProps) {
  const t = useTranslations("ProductReviews")
  const isMobile = useIsMobile()
  const [isPending, startTransition] = React.useTransition()
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)

  const isUpdate = mode === "update"
  const formId = React.useId()

  const dialogTitle = isUpdate
    ? t("UPDATE_REVIEW_DIALOG_TITLE")
    : t("CREATE_REVIEW_DIALOG_TITLE")
  const dialogDescription = isUpdate
    ? t("UPDATE_REVIEW_DIALOG_DESCRIPTION")
    : t("CREATE_REVIEW_DIALOG_DESCRIPTION")

  const form = useForm<ReviewFormValues>({
    defaultValues: {
      rating: isUpdate && review ? review.rating : 5,
      content: isUpdate && review ? (review.content ?? "") : "",
    },
    mode: "onChange",
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    if (nextOpen) {
      form.reset({
        rating: isUpdate && review ? review.rating : 5,
        content: isUpdate && review ? (review.content ?? "") : "",
      })
      setHoverRating(null)
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        let result

        if (isUpdate && review) {
          result = await updateReview({
            reviewId: review.id,
            rating: Number(values.rating),
            content: values.content.trim() || null,
          })
        } else if (productId) {
          result = await createReview({
            productId,
            rating: Number(values.rating),
            content: values.content.trim() || null,
          })
        } else {
          return
        }

        if (!result.success) {
          toast.error(
            result.error
              ? t(getActionErrorKey(result.error))
              : isUpdate
                ? t("UPDATE_REVIEW_ERROR")
                : t("CREATE_REVIEW_ERROR")
          )

          return
        }

        onOpenChange(false)
        onSuccess()
        toast.success(
          isUpdate ? t("UPDATE_REVIEW_SUCCESS") : t("CREATE_REVIEW_SUCCESS")
        )
      } catch {
        toast.error(
          isUpdate ? t("UPDATE_REVIEW_ERROR") : t("CREATE_REVIEW_ERROR")
        )
      }
    })
  })

  const formFields = (
    <form id={formId} onSubmit={onSubmit} className="space-y-4 py-1">
      {/* شريط اختيار النجوم التفاعلي */}
      <Controller
        name="rating"
        control={form.control}
        rules={{ required: t("RATING_REQUIRED") }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs text-muted-foreground">
              {t("RATING_LABEL")}
            </FieldLabel>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeVal = hoverRating ?? field.value
                const isSelected = star <= activeVal

                return (
                  <button
                    key={star}
                    type="button"
                    disabled={isPending}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none active:scale-95"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => field.onChange(star)}
                  >
                    <StarIcon
                      className={`size-6 transition-colors ${
                        isSelected
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30 hover:text-muted-foreground"
                      }`}
                    />
                  </button>
                )
              })}
              <span className="ms-2 text-xs font-medium text-foreground tabular-nums">
                ({field.value}/5)
              </span>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* حقل محتوى التعليق */}
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor="review-content"
              className="text-xs text-muted-foreground"
            >
              {t("CONTENT_LABEL")}
            </FieldLabel>
            <Textarea
              {...field}
              id="review-content"
              disabled={isPending}
              placeholder={t("CONTENT_PLACEHOLDER")}
              className="min-h-24 text-sm sm:text-xs"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  )

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => handleOpenChange(false)}
        className="h-10 flex-1 rounded-xl text-xs sm:h-9 sm:flex-initial sm:rounded-md"
      >
        {t("CANCEL_BUTTON")}
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isPending || !form.formState.isValid}
        className="h-10 flex-1 rounded-xl text-xs sm:h-9 sm:flex-initial sm:rounded-md"
      >
        {isPending ? (
          <>
            <Spinner className="me-1.5 size-3.5" />
            {t("SAVING_BUTTON")}
          </>
        ) : (
          t("SAVE_CHANGES_BUTTON")
        )}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen || !isPending) handleOpenChange(nextOpen)
        }}
      >
        {children && <BottomSheetTrigger asChild>{children}</BottomSheetTrigger>}

        <BottomSheetContent ariaLabel={dialogTitle}>
          <BottomSheetHeader>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {dialogTitle}
            </h2>
            <p className="text-xs text-muted-foreground">{dialogDescription}</p>
          </BottomSheetHeader>

          <BottomSheetBody className="px-4 py-3.5">{formFields}</BottomSheetBody>

          <BottomSheetFooter className="flex flex-row items-center gap-2">
            {actionButtons}
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || !isPending) handleOpenChange(nextOpen)
      }}
    >
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        {formFields}

        <DialogFooter>{actionButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}