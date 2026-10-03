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
import { deleteProduct } from "@/lib/actions/products/mutations/delete"
import { AdminProductSummary } from "@/lib/actions/products/types"

interface DeleteProductDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProductSummary | null
  onSuccess: (deletedId: string) => void
}

export default function DeleteProductDialog({
  isOpen,
  onOpenChange,
  product,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!product) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProduct(product.id)
      if (res.success) {
        toast.success(`Product "${product.name}" deleted successfully.`)
        onSuccess(product.id)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to delete product. Please try again.")
      }
    } catch (error) {
      console.error("Delete product error:", error)
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
            Delete Product
          </CustomAlertDialogTitle>
          <CustomAlertDialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{product.name}&quot;
            </span>
            ? This action cannot be undone and will permanently remove this
            product, its variants, and associated images.
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
                Delete Product
              </>
            )}
          </CustomAlertDialogAction>
        </CustomAlertDialogFooter>
      </CustomAlertDialogContent>
    </CustomAlertDialog>
  )
}
