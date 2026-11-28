"use client"

/**
 * @file components/store/product-details/reviews/review-dialog.tsx
 * @description Shared dialog/bottom-sheet component for creating or updating a product review with an interactive star rating bar.
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import type { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface ReviewDialogProps {
  productId?: string
  review?: ProductReviewItem | null
  mode: "create" | "update"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  children?: React.ReactNode
}

/** يجب أن يطابق هذا الحد التحقق في createReview و updateReview وقاعدة البيانات */
const MAX_CONTENT_LENGTH = 1000

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
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isPending, startTransition] = React.useTransition()
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)

  const isUpdate = mode === "update"
  const formId = React.useId()
  const ratingLabelId = `${formId}-rating`
  const contentId = `${formId}-content`

  const dialogTitle = isUpdate
    ? t("UPDATE_REVIEW_DIALOG_TITLE")
    : t("CREATE_REVIEW_DIALOG_TITLE")
  const dialogDescription = isUpdate
    ? t("UPDATE_REVIEW_DIALOG_DESCRIPTION")
    : t("CREATE_REVIEW_DIALOG_DESCRIPTION")

  // 0 يعني "لم يتم الاختيار"، حتى لا يُرسل تقييم 5 نجوم دون قصد
  const getInitialValues = (): ReviewFormValues => ({
    rating: isUpdate && review ? review.rating : 0,
    content: isUpdate && review ? (review.content ?? "") : "",
  })

  const form = useForm<ReviewFormValues>({
    defaultValues: getInitialValues(),
    mode: "onChange",
  })

  const contentLength = useWatch({
    control: form.control,
    name: "content",
  }).length

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    if (nextOpen) {
      form.reset(getInitialValues())
      setHoverRating(null)
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = form.handleSubmit((values) => {
    if (isPending) return

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
          toast.error(
            isUpdate ? t("UPDATE_REVIEW_ERROR") : t("CREATE_REVIEW_ERROR")
          )
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
        onSuccess?.()
        toast.success(
          isUpdate ? t("UPDATE_REVIEW_SUCCESS") : t("CREATE_REVIEW_SUCCESS")
        )
        router.refresh()
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
        rules={{ validate: (value) => value >= 1 || t("RATING_REQUIRED") }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <span id={ratingLabelId} className="text-xs text-muted-foreground">
              {t("RATING_LABEL")}
            </span>
            {/* أزرار radio أصلية: تنقّل بالأسهم ودعم قارئ الشاشة */}
            <div className="flex items-center gap-1 py-1">
              <div
                role="radiogroup"
                aria-labelledby={ratingLabelId}
                className="flex items-center"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = star <= (hoverRating ?? field.value)

                  return (
                    <label
                      key={star}
                      className="cursor-pointer p-1.5 transition-transform hover:scale-110 active:scale-95 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
                      onMouseEnter={() => {
                        if (!isPending) setHoverRating(star)
                      }}
                    >
                      <input
                        type="radio"
                        name={`${formId}-stars`}
                        value={star}
                        checked={field.value === star}
                        disabled={isPending}
                        onChange={() => field.onChange(star)}
                        onBlur={field.onBlur}
                        aria-label={t("STAR_OPTION_ARIA", { rating: star })}
                        className="peer sr-only"
                      />
                      <StarIcon
                        aria-hidden="true"
                        className={`size-7 rounded-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring sm:size-6 ${
                          isSelected
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </label>
                  )
                })}
              </div>
              {field.value > 0 && (
                <span
                  dir="ltr"
                  className="ms-2 text-xs font-medium text-foreground tabular-nums"
                >
                  {field.value}/5
                </span>
              )}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* حقل محتوى التعليق */}
      <Controller
        name="content"
        control={form.control}
        rules={{
          maxLength: {
            value: MAX_CONTENT_LENGTH,
            message: t("CONTENT_TOO_LONG", { max: MAX_CONTENT_LENGTH }),
          },
        }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              htmlFor={contentId}
              className="text-xs text-muted-foreground"
            >
              {t("CONTENT_LABEL")}
            </FieldLabel>
            <Textarea
              {...field}
              id={contentId}
              dir="auto"
              maxLength={MAX_CONTENT_LENGTH}
              aria-invalid={fieldState.invalid}
              disabled={isPending}
              placeholder={t("CONTENT_PLACEHOLDER")}
              className="max-h-48 min-h-24 border-0 bg-background/90 text-base shadow-none ring-0 focus-visible:ring-0 sm:text-sm dark:bg-muted/40"
            />
            <span
              dir="ltr"
              className="self-end text-xs text-muted-foreground tabular-nums"
            >
              {contentLength}/{MAX_CONTENT_LENGTH}
            </span>
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
        variant="ghost"
        disabled={isPending}
        onClick={() => handleOpenChange(false)}
        className="h-10 flex-1 rounded-xl border-0 bg-background/90 text-xs shadow-none ring-0 hover:bg-muted sm:h-9 sm:flex-initial sm:rounded-md dark:bg-muted/40"
      >
        {t("CANCEL_BUTTON")}
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isPending || !form.formState.isValid}
        aria-busy={isPending}
        className="h-10 flex-1 rounded-xl border-0 text-xs shadow-none sm:h-9 sm:flex-initial sm:rounded-md"
      >
        {isPending ? (
          <>
            <Spinner className="me-1.5 size-3.5" />
            {t("SAVING_BUTTON")}
          </>
        ) : isUpdate ? (
          t("SAVE_CHANGES_BUTTON")
        ) : (
          t("SUBMIT_REVIEW_BUTTON")
        )}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={handleOpenChange}>
        {children && (
          <BottomSheetTrigger asChild>{children}</BottomSheetTrigger>
        )}

        <BottomSheetContent ariaLabel={dialogTitle}>
          <BottomSheetHeader>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {dialogTitle}
            </h2>
            <p className="text-xs text-muted-foreground">{dialogDescription}</p>
          </BottomSheetHeader>

          <BottomSheetBody className="px-4 py-3">
            {formFields}
          </BottomSheetBody>

          <BottomSheetFooter className="flex flex-row items-center gap-2">
            {actionButtons}
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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