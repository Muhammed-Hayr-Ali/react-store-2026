"use client"

/**
 * @file components/dashboard/brands/delete-brand-dialog.tsx
 * @description Confirms and deletes a storefront brand.
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
import { deleteBrand } from "@/lib/actions/brands"
import type { BrandRecord } from "@/lib/actions/brands/types"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { LoaderCircleIcon } from "lucide-react"

interface DeleteBrandDialogProps {
  brand: BrandRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (brand: BrandRecord) => void
  children?: React.ReactNode
}

interface DeleteBrandFormValues {
  confirmName: string
}

export function DeleteBrandDialog({
  brand,
  open,
  onOpenChange,
  onDeleted,
  children,
}: DeleteBrandDialogProps) {
  const t = useTranslations("BrandsManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<DeleteBrandFormValues>({
    defaultValues: { confirmName: "" },
    mode: "onChange",
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) form.reset()
  }

  const handleDelete = () => {
    if (!brand || !form.formState.isValid) return

    startTransition(async () => {
      try {
        const result = await deleteBrand({ id: brand.id })

        if (!result.success) {
          toast.error(
            result.error
              ? tErrors(getActionErrorKey(result.error))
              : t("DELETE_ERROR")
          )
          return
        }

        form.reset()
        onOpenChange(false)
        onDeleted(brand)
        toast.success(t("DELETE_SUCCESS"))
      } catch {
        toast.error(t("DELETE_ERROR"))
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
      {brand && (
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
                {brand.name}
              </span>
              . {t("DELETE_DIALOG_WARNING")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Controller
            name="confirmName"
            control={form.control}
            rules={{
              required: t("BRAND_NAME_CONFIRMATION_REQUIRED"),
              validate: (value) =>
                value === brand.name || t("BRAND_NAME_CONFIRMATION_MISMATCH"),
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="confirm-brand-name"
                  className="text-xs text-muted-foreground"
                >
                  {t("TYPE_BRAND_NAME_TO_CONFIRM")}{" "}
                  <span className="font-semibold text-foreground select-all">
                    {brand.name}
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-brand-name"
                  disabled={isPending}
                  placeholder={t("CONFIRM_BRAND_NAME_PLACEHOLDER")}
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
