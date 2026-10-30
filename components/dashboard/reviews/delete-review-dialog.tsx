"use client"

/**
 * @file components/dashboard/reviews/delete-review-dialog.tsx
 * @description Confirms and deletes a product review.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { deleteReview } from "@/lib/actions/reviews/mutations/delete-review"
import type { ReviewWithUser } from "@/lib/actions/reviews/types"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface DeleteReviewDialogProps {
  review: ReviewWithUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (review: ReviewWithUser) => void
  children?: React.ReactNode
}

interface DeleteReviewFormValues {
  confirmName: string
}

export function DeleteReviewDialog({
  review,
  open,
  onOpenChange,
  onDeleted,
  children,
}: DeleteReviewDialogProps) {
  const t = useTranslations("ReviewsManagement")
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<DeleteReviewFormValues>({
    defaultValues: { confirmName: "" },
    mode: "onChange",
  })

  // نحصل على اسم المستخدم أو "مجهول" لعرضه في رسالة التأكيد ومقارنته في الحقل
  const reviewerName = review?.user?.first_name 
    ? `${review.user.first_name} ${review.user.last_name || ""}`.trim() 
    : t("ANONYMOUS")

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) form.reset()
  }

  const handleDelete = () => {
    if (!review || !form.formState.isValid) return

    startTransition(async () => {
      try {
        const result = await deleteReview(review.id)
        if (!result.success) {
          toast.error(
            result.error
              ? t(getActionErrorKey(result.error))
              : t("DELETE_ERROR_TOAST")
          )
          return
        }

        form.reset()
        onOpenChange(false)
        onDeleted(review)
        toast.success(t("DELETE_SUCCESS_TOAST", { name: reviewerName }))
      } catch {
        toast.error(t("DELETE_ERROR_TOAST"))
      }
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (open || !isPending) handleOpenChange(open)
      }}
    >
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      {review && (
        <AlertDialogContent
          onEscapeKeyDown={(event) => {
            if (isPending) event.preventDefault()
          }}
        >
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {t("DELETE_DIALOG_TITLE")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              {t("DELETE_DIALOG_DESCRIPTION")}{" "}
              <span className="font-semibold text-foreground">
                {reviewerName}
              </span>
              . {t("CANNOT_BE_UNDONE")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Controller
            name="confirmName"
            control={form.control}
            rules={{
              required: t("REVIEW_NAME_CONFIRMATION_REQUIRED"),
              validate: (value) =>
                value === reviewerName ||
                t("REVIEW_NAME_CONFIRMATION_MISMATCH"),
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="confirm-review-name"
                  className="text-xs text-muted-foreground"
                >
                  {t("TYPE_REVIEW_NAME_TO_CONFIRM")}{" "}
                  <span className="font-semibold text-foreground select-all">
                    {reviewerName}
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-review-name"
                  disabled={isPending}
                  placeholder={t("CONFIRM_REVIEW_NAME_PLACEHOLDER")}
                  autoComplete="off"
                  className="h-9 text-xs"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="mt-0 text-xs">
              {t("CANCEL_BUTTON")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || !form.formState.isValid}
              className="text-xs"
            >
              {isPending ? (
                <>
                  <Spinner className="me-1.5 size-3.5" />
                  {t("DELETING_BUTTON")}
                </>
              ) : (
                t("CONFIRM_DELETE_BUTTON")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  )
}