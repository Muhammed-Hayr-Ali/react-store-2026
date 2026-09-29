"use client"

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
import { deleteReview } from "@/lib/actions/reviews"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeleteReviewDialogProps {
  id: string | null
  isOpen: string | null
  onOpenChange: (open: boolean) => void
}

export function DeleteReviewDialog({
  id,
  isOpen,
  onOpenChange,
}: DeleteReviewDialogProps) {
  const router = useRouter()

  if (!id) return null

  const handleDelete = async () => {
    try {
      const result = await deleteReview(id)
      if (result.success) {
        toast.success("Review deleted successfully!")
        router.refresh()
      } else {
        toast.error("Failed to delete review.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={isOpen === "deleteReview"} onOpenChange={onOpenChange}>
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
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
