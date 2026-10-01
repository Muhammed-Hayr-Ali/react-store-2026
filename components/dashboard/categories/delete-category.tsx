"use client"

import * as React from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import {
  CustomAlertDialog,
  CustomAlertDialogAction,
  CustomAlertDialogCancel,
  CustomAlertDialogContent,
  CustomAlertDialogDescription,
  CustomAlertDialogFooter,
  CustomAlertDialogHeader,
  CustomAlertDialogMedia,
  CustomAlertDialogTitle,
} from "@/components/ui/custom-alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { deleteCategory } from "@/lib/actions/categories/mutations/delete"
import { Category } from "@/lib/actions/categories"

interface DeleteCategoryDialogProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: Category | null
  onSuccess?: (deletedCategoryId: string) => void
}

export default function DeleteCategoryDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  item,
}: DeleteCategoryDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteCategory(item.id)

      if (result.success) {
        toast.success("Category deleted successfully.")
        onSuccess?.(item.id)
        onOpenChange(false)
      } else {
        toast.error(
          result.error || "Failed to delete category. Please try again."
        )
      }
    } catch (error) {
      console.error("Delete category error:", error)
      toast.error("An unexpected error occurred while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <CustomAlertDialog open={isOpen === "delete"} onOpenChange={onOpenChange}>
      <CustomAlertDialogContent className="min-w-1/4">
        <CustomAlertDialogHeader>
          <CustomAlertDialogMedia>
            <Trash2Icon className="text-destructive" />
          </CustomAlertDialogMedia>
          <CustomAlertDialogTitle>Delete Category</CustomAlertDialogTitle>
          <CustomAlertDialogDescription>
            Are you sure you want to delete the category{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{item.name}&quot;
            </span>
            ? This action cannot be undone.
          </CustomAlertDialogDescription>
        </CustomAlertDialogHeader>

        <CustomAlertDialogFooter>
          <CustomAlertDialogCancel disabled={isDeleting}>
            Cancel
          </CustomAlertDialogCancel>
          <CustomAlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner className="size-4" /> : "Yes, delete"}
          </CustomAlertDialogAction>
        </CustomAlertDialogFooter>
      </CustomAlertDialogContent>
    </CustomAlertDialog>
  )
}
