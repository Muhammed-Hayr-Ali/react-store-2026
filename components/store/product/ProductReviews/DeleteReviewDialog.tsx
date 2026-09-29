"use client"

import * as React from "react"
import { Trash2Icon, Loader2Icon } from "lucide-react"

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
import { deleteReview, ReviewDialogName } from "@/lib/actions/reviews"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeleteReviewDialogProps {
  id: string | null
  openDialog: ReviewDialogName | null
  onOpenChange: (open: boolean) => void
}

export function DeleteReviewDialog({
  id,
  openDialog,
  onOpenChange,
}: DeleteReviewDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!id) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteReview(id)
      if (result.success) {
        toast.success("Review deleted successfully!")
        router.refresh()
        onOpenChange(false)
      } else {
        toast.error("Failed to delete review.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={openDialog === "delete-review"}
      onOpenChange={(open) => {
        if (!isDeleting) onOpenChange(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Review?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
