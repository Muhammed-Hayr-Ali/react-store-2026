"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { LoaderCircleIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { deletePromoBanner } from "@/lib/actions/promo-banners"
import type { PromoBanner } from "@/lib/actions/promo-banners"

interface DeletePromoBannerDialogProps {
  banner: PromoBanner | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (banner: PromoBanner) => void
}

interface DeletePromoBannerFormValues {
  confirmTitle: string
}

export function DeletePromoBannerDialog({
  banner,
  open,
  onOpenChange,
  onDeleted,
}: DeletePromoBannerDialogProps) {
  const t = useTranslations("PromoBannersManagement")
  const errorT = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<DeletePromoBannerFormValues>({
    defaultValues: { confirmTitle: "" },
    mode: "onChange",
  })

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) form.reset()
  }

  const handleDelete = (): void => {
    if (!banner || !form.formState.isValid) return

    startTransition(async () => {
      const result = await deletePromoBanner({ id: banner.id })
      if (!result.success) {
        toast.error(errorT(getActionErrorKey(result.error)))
        return
      }

      form.reset()
      onOpenChange(false)
      onDeleted(banner)
      toast.success(t("DELETE_SUCCESS"))
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (nextOpen || !isPending) handleOpenChange(nextOpen)
      }}
    >
      {banner && (
        <AlertDialogContent
          onEscapeKeyDown={(event: KeyboardEvent) => {
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
                {banner.title}
              </span>
              . {t("DELETE_DIALOG_WARNING")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Controller
            name="confirmTitle"
            control={form.control}
            rules={{
              required: t("BANNER_TITLE_CONFIRMATION_REQUIRED"),
              validate: (value: string) =>
                value === banner.title ||
                t("BANNER_TITLE_CONFIRMATION_MISMATCH"),
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="confirm-promo-banner-title"
                  className="text-xs text-muted-foreground"
                >
                  {t("TYPE_BANNER_TITLE_TO_CONFIRM")}{" "}
                  <span className="font-semibold text-foreground select-all">
                    {banner.title}
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-promo-banner-title"
                  disabled={isPending}
                  placeholder={t("CONFIRM_BANNER_TITLE_PLACEHOLDER")}
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
            <AlertDialogCancel disabled={isPending} className="h-9 text-xs">
              {t("CANCEL_BUTTON")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || !form.formState.isValid}
              className="h-9 gap-1.5 text-xs"
            >
              {isPending && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {isPending ? t("DELETING_BUTTON") : t("DELETE_CONFIRM")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  )
}
