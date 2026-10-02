"use client"

import * as React from "react"
import { toast } from "sonner"
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
import { Spinner } from "@/components/ui/spinner"
import { deleteProduct } from "@/lib/actions/products/mutations/delete"
import { AdminProductSummary } from "@/lib/actions/products/types"

interface DeleteProductDialogProps {
  product: AdminProductSummary | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (deletedId: string) => void
}

export default function DeleteProductDialog({
  product,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!product) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProduct(product.id)
      if (res.success) {
        toast.success(`Product "${product.name}" deleted successfully`)
        onSuccess(product.id)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to delete product")
      }
    } catch {
      toast.error("An unexpected error occurred while deleting the product")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{product.name}&quot;
            </span>
            ? This action cannot be undone and will permanently remove this
            product, its variants, and associated images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner className="me-2 size-4" />
                Deleting...
              </>
            ) : (
              "Delete Product"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
