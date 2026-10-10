"use client"

import * as React from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deleteCategory } from "@/lib/actions/categories"

interface DeleteCategoryDialogProps {
  categoryId: string
  categoryName: string
  children?: React.ReactNode
  onDeleted?: (deletedId: string) => void
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  children,
  onDeleted,
}: DeleteCategoryDialogProps) {
  const t = useTranslations("CategoriesManagement")
  const [isPending, startTransition] = React.useTransition()
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteCategory(categoryId)
        if (res.success) {
          toast.success(t("CATEGORY_DELETED_SUCCESS", { name: categoryName }))
          onDeleted?.(categoryId)
          closeRef.current?.click() // Programmatic uncontrolled dismissal
        } else {
          toast.error(res.error || t("FAILED_TO_DELETE"))
        }
      } catch {
        toast.error(t("UNEXPECTED_ERROR"))
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-3.5" />
            <span>{t("DELETE_ACTION")}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <DialogHeader className="gap-2 text-start">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <DialogTitle className="text-base font-semibold">
            {t("DELETE_DIALOG_TITLE")}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {t("DELETE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold text-foreground">
              &quot;{categoryName}&quot;
            </span>
            ? {t("ACTION_CANNOT_BE_UNDONE")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-xs"
            >
              {t("CANCEL_BUTTON")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
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

          {/* Programmatic uncontrolled close ref */}
          <DialogClose ref={closeRef} className="hidden" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
