"use client"

/**
 * @file components/store/product-details/reviews/delete-review-dialog.tsx
 * @description Confirmation dialog for deleting a product review.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
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
import { Spinner } from "@/components/ui/spinner"
import { deleteReview } from "@/lib/actions/store/product-details/reviews/mutations/delete-review"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { ProductReviewItem } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"

interface DeleteReviewDialogProps {
  review: ProductReviewItem
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

export function DeleteReviewDialog({
  review,
  open,
  onOpenChange,
  children,
}: DeleteReviewDialogProps) {
  const t = useTranslations("ProductReviews")
  const [isPending, startTransition] = React.useTransition()

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteReview(review.id)
        if (!result.success) {
          toast.error(
            result.error
              ? t(getActionErrorKey(result.error))
              : t("DELETE_REVIEW_ERROR")
          )
          return
        }

        onOpenChange(false)
        toast.success(t("DELETE_REVIEW_SUCCESS"))
      } catch {
        toast.error(t("DELETE_REVIEW_ERROR"))
      }
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || !isPending) handleOpenChange(nextOpen)
      }}
    >
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("DELETE_REVIEW_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("DELETE_REVIEW_DIALOG_DESCRIPTION")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="mt-0 text-xs">
            {t("CANCEL_BUTTON")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? (
              <>
                <Spinner className="me-1.5 size-3.5" />
                {t("DELETING_BUTTON")}
              </>
            ) : (
              t("DELETE_CONFIRM_BUTTON")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
