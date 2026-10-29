/**
 * @file components/dashboard/reviews/review-status-sheet.tsx
 * @description Provides the edit form sheet for moderating a product review status.
 */

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  MessageSquareIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ReviewWithUser } from "@/lib/actions/reviews/types"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { updateReview } from "@/lib/actions/reviews/mutations/update-review"
import { UpdateReviewInput } from "@/lib/actions/reviews/schemas"

interface ReviewStatusSheetProps {
  open: boolean
  review: ReviewWithUser | null
  onOpenChange: (open: boolean) => void
  onSaved: (review: ReviewWithUser) => void
}

interface ReviewStatusFormState {
  is_approved: boolean
}

export function ReviewStatusSheet({
  open,
  review,
  onOpenChange,
  onSaved,
}: ReviewStatusSheetProps) {
  const t = useTranslations("ReviewsManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()

  const reviewerName = review?.user?.first_name
    ? `${review.user.first_name} ${review.user.last_name || ""}`.trim()
    : t("ANONYMOUS")

  const formSchema = React.useMemo(
    () =>
      z.object({
        is_approved: z.boolean(),
      }),
    []
  )

  const form = useForm<ReviewStatusFormState>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { is_approved: false },
  })
  const { control, reset, handleSubmit: handleFormSubmit } = form

  React.useEffect(() => {
    if (!open) return
    reset({
      is_approved: review?.is_approved ?? false,
    })
  }, [review, open, reset])

  const handleSubmit = (formValues: ReviewStatusFormState) => {
    if (!review) return

    startTransition(async () => {
      try {
        // تم تعديل الاستدعاء ليتوافق مع المعرف `reviewId` المطلوب في السيرفر أكشن
        const result = await updateReview({
          reviewId: review.id,
          rating: review.rating,
          content: review.content,
          is_approved: formValues.is_approved,
        } as UpdateReviewInput)

        if (!result.success) {
          toast.error(
            result.error
              ? tErrors(getActionErrorKey(result.error))
              : t("SAVE_ERROR")
          )
          return
        }

        const updatedReview = { ...review, is_approved: formValues.is_approved }
        onSaved(updatedReview)
        onOpenChange(false)
        toast.success(t("UPDATE_SUCCESS"))
      } catch {
        toast.error(t("SAVE_ERROR"))
      }
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      <SheetContent
        side="right"
        className="gap-0 p-0 sm:max-w-xl"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4 pe-12 sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary">
              <ShieldCheckIcon className="size-4 text-primary" />
            </span>
            {t("FORM_EDIT_TITLE")}
          </SheetTitle>
          <SheetDescription>{t("FORM_EDIT_DESCRIPTION")}</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event) => {
            event.stopPropagation()
            void handleFormSubmit(handleSubmit)(event)
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {/* قسم عرض تفاصيل التقييم (للقراءة فقط) */}
            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <MessageSquareIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("REVIEW_DETAILS_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("REVIEW_DETAILS_DESCRIPTION")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">
                    {t("AUTHOR_LABEL")}
                  </label>
                  <p className="text-sm font-medium text-foreground">
                    {reviewerName}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    {t("RATING_LABEL")}
                  </label>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`size-4 ${i < (review?.rating || 0) ? "fill-current" : "text-muted opacity-30"}`}
                      />
                    ))}
                    <span className="ms-1 text-xs font-semibold text-foreground tabular-nums">
                      ({review?.rating})
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    {t("CONTENT_LABEL")}
                  </label>
                  <div className="mt-1 rounded-md border border-border/60 bg-muted/50 p-3 text-sm text-foreground">
                    {review?.content}
                  </div>
                </div>
              </div>
            </section>

            {/* قسم التحكم وتغيير الحالة (قابل للتعديل) */}
            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <ShieldCheckIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("MODERATION_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("MODERATION_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <Controller
                  name="is_approved"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="review-approved"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 text-xs transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          id="review-approved"
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          disabled={isPending}
                        />
                        {t("APPROVED_LABEL")}
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </section>
          </div>

          <SheetFooter className="flex-row justify-end border-t border-border/60 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs"
            >
              {t("CANCEL_BUTTON")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-1.5 text-xs"
            >
              {isPending && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {isPending ? t("SAVING_BUTTON") : t("SAVE_BUTTON")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
