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
import { Brand, deleteBrand } from "@/lib/actions/brands"

interface DeleteBrandDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: Brand | null
  onSuccess?: (deletedBrandId: string) => void
}

export default function DeleteBrandDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  item,
}: DeleteBrandDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteBrand(item.id)

      if (result.success) {
        toast.success(`Brand "${item.name}" deleted successfully.`)
        onSuccess?.(item.id)
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to delete brand. Please try again.")
      }
    } catch (error) {
      console.error("Delete brand error:", error)
      toast.error("An unexpected error occurred while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <CustomAlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomAlertDialogContent className="max-w-md">
        <CustomAlertDialogHeader>
          <CustomAlertDialogMedia>
            <Trash2Icon className="size-5 text-destructive" />
          </CustomAlertDialogMedia>
          <CustomAlertDialogTitle className="text-base font-bold text-foreground">
            Delete Brand
          </CustomAlertDialogTitle>
          <CustomAlertDialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{item.name}&quot;
            </span>
            ? This action cannot be undone and will unlink this brand from all
            associated products.
          </CustomAlertDialogDescription>
        </CustomAlertDialogHeader>

        <CustomAlertDialogFooter className="flex flex-col-reverse items-stretch gap-2 pt-3 sm:flex-row sm:items-center sm:justify-end">
          <CustomAlertDialogCancel
            disabled={isDeleting}
            className="w-full text-xs sm:w-auto"
          >
            Cancel
          </CustomAlertDialogCancel>
          <CustomAlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-28"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-1.5 size-3.5" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2Icon className="mr-1.5 size-3.5" />
                Delete Brand
              </>
            )}
          </CustomAlertDialogAction>
        </CustomAlertDialogFooter>
      </CustomAlertDialogContent>
    </CustomAlertDialog>
  )
}
