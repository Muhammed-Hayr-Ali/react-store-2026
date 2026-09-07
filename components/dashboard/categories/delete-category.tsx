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
import { Category } from "./categories-table"
import { deleteCategory } from "@/lib/actions/categories/dalete-category"

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
      console.error("Delete error:", error)
      toast.error("An unexpected error occurred while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <CustomAlertDialog open={isOpen === "delete"} onOpenChange={onOpenChange}>
      <CustomAlertDialogContent className="min-w-1/4">
        {/* <CustomAlertDialogHeader className="text-center sm:text-left">
          <CustomAlertDialogMedia className="mb-2 flex justify-center sm:justify-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2Icon className="size-6 text-destructive" />
            </div>
          </CustomAlertDialogMedia>

          <CustomAlertDialogTitle className="text-base">
            Delete Category
          </CustomAlertDialogTitle>

          <CustomAlertDialogDescription className="text-sm">
            Are you sure you want to delete the category{" "}
            <span className="font-semibold break-words text-foreground">
              &quot;{item.name}&quot;
            </span>
            ?
            <br />
            <span className="mt-2 block text-xs text-muted-foreground">
              This action cannot be undone. This will permanently remove the
              category and its associated data from our servers.
            </span>
          </CustomAlertDialogDescription>
        </CustomAlertDialogHeader> */}

        <CustomAlertDialogHeader>
          <CustomAlertDialogMedia>
            <Trash2Icon />
          </CustomAlertDialogMedia>
          <CustomAlertDialogTitle>Delete Category</CustomAlertDialogTitle>
          <CustomAlertDialogDescription>
            Are you sure you want to delete the category{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{item.name}&quot;
            </span>{" "}
            ?
          </CustomAlertDialogDescription>
        </CustomAlertDialogHeader>

        {/* 3. تحسين الأزرار: تعطيل الكل أثناء التحميل، وإظهار حالة التحميل بوضوح */}
        <CustomAlertDialogFooter>
          <CustomAlertDialogCancel>Cancel</CustomAlertDialogCancel>
          <CustomAlertDialogAction variant="destructive" onClick={handleDelete}>
            {isDeleting ? <Spinner /> : " Yes, delete"}
          </CustomAlertDialogAction>
        </CustomAlertDialogFooter>
      </CustomAlertDialogContent>
    </CustomAlertDialog>
  )
}
