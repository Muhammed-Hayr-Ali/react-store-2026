"use client"

/**
 * @file components/dashboard/product/delete-product-dialog.tsx
 * @description Confirms and deletes a storefront product with name confirmation requirement.
 */

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { deleteProduct } from "@/lib/actions/products/mutations/delete"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface DeleteProductDialogProps {
  productId: string
  productName: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDeleted?: (productId: string) => void
  children?: React.ReactNode
}

interface DeleteProductFormValues {
  confirmName: string
}

export function DeleteProductDialog({
  productId,
  productName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onDeleted,
  children,
}: DeleteProductDialogProps) {
  const t = useTranslations("ProductsManagement")
  const [isPending, startTransition] = React.useTransition()

  // حالة داخلية احتياطية لضمان عمل الحوار بشكل مستقل (Uncontrolled) إذا لم يُمرر له الأب حالة
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen ?? uncontrolledOpen
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen

  const form = useForm<DeleteProductFormValues>({
    defaultValues: { confirmName: "" },
    mode: "onChange",
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    onOpenChange(nextOpen)
    if (!nextOpen) form.reset()
  }

  const handleDelete = () => {
    if (!form.formState.isValid) return

    startTransition(async () => {
      try {
        const result = await deleteProduct(productId)

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
        onDeleted?.(productId)
        toast.success(t("DELETE_SUCCESS_TOAST", { name: productName }))
      } catch {
        toast.error(t("GENERIC_ERROR_TOAST"))
      }
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen || !isPending) handleOpenChange(isOpen)
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
            {t("DELETE_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("DELETE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold text-foreground select-all">
              {productName}
            </span>
            . {t("CANNOT_BE_UNDONE")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Controller
          name="confirmName"
          control={form.control}
          rules={{
            required: t("PRODUCT_NAME_CONFIRMATION_REQUIRED"),
            validate: (value) =>
              value === productName || t("PRODUCT_NAME_CONFIRMATION_MISMATCH"),
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="confirm-product-name"
                className="text-xs text-muted-foreground"
              >
                {t("TYPE_PRODUCT_NAME_TO_CONFIRM")}{" "}
                <span className="font-semibold text-foreground select-all">
                  {productName}
                </span>{" "}
                {t("TO_CONFIRM")}
              </FieldLabel>
              <Input
                {...field}
                id="confirm-product-name"
                disabled={isPending}
                placeholder={productName}
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
            {isPending ? t("DELETING_BUTTON") : t("CONFIRM_DELETE_BUTTON")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteProductDialog