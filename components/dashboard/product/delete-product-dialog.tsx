"use client"

import * as React from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { deleteProduct } from "@/lib/actions/products/mutations/delete"
import { AdminProductSummary } from "@/lib/actions/products/types"

interface DeleteProductDialogProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: AdminProductSummary | null
  onSuccess?: (deletedId: string) => void
}

export default function DeleteProductDialog({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProduct(item.id)
      if (res.success) {
        toast.success(`Product "${item.name}" deleted successfully.`)
        onSuccess?.(item.id)
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
    <AlertDialog open={isOpen === "delete"} onOpenChange={onOpenChange}>
      <AlertDialogContent className="min-w-1/4">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the product{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{item.name}&quot;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner className="size-4" /> : "Yes, delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
