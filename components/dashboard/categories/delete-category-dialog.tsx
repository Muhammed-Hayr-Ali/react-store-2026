"use client"

/**
 * @file components/dashboard/categories/delete-category-dialog.tsx
 * @description Confirms and deletes a storefront category.
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
import { deleteCategory } from "@/lib/actions/categories"
import type { Category } from "@/lib/actions/categories"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { LoaderCircleIcon } from "lucide-react"

interface DeleteCategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (category: Category) => void
  children?: React.ReactNode
}

interface DeleteCategoryFormValues {
  confirmName: string
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onDeleted,
  children,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("CategoriesManagement")
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<DeleteCategoryFormValues>({
    defaultValues: { confirmName: "" },
    mode: "onChange",
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) form.reset()
  }

  const handleDelete = () => {
    if (!category || !form.formState.isValid) return

    startTransition(async () => {
      try {
        const result = await deleteCategory({ id: category.id })
        if (!result.success) {
          toast.error(
            result.error
              ? t(getActionErrorKey(result.error))
              : t("DELETE_ERROR")
          )
          return
        }

        form.reset()
        onOpenChange(false)
        onDeleted(category)
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
      {category && (
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
                {category.name}
              </span>
              . {t("DELETE_DIALOG_WARNING")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Controller
            name="confirmName"
            control={form.control}
            rules={{
              required: t("CATEGORY_NAME_CONFIRMATION_REQUIRED"),
              validate: (value) =>
                value === category.name ||
                t("CATEGORY_NAME_CONFIRMATION_MISMATCH"),
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="confirm-category-name"
                  className="text-xs text-muted-foreground"
                >
                  {t("TYPE_CATEGORY_NAME_TO_CONFIRM")}{" "}
                  <span className="font-semibold text-foreground select-all">
                    {category.name}
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id="confirm-category-name"
                  disabled={isPending}
                  placeholder={t("CONFIRM_CATEGORY_NAME_PLACEHOLDER")}
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

            {/* 
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-1.5 text-xs"
            >
              {isPending && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {isPending ? t("SAVING_BUTTON") : t("SAVE_BUTTON")}
            </Button> */}

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
