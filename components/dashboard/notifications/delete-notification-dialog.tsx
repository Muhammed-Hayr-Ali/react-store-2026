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
import { deleteNotification } from "@/lib/actions/notifications/mutations/delete"
import { AdminNotificationRecord } from "@/lib/actions/notifications/types"

interface DeleteNotificationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: AdminNotificationRecord | null
  onSuccess?: (deletedId: string) => void
}

export default function DeleteNotificationDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  item,
}: DeleteNotificationDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteNotification(item.id)

      if (result.success) {
        toast.success(`Notification "${item.title}" deleted successfully.`)
        onSuccess?.(item.id)
        onOpenChange(false)
      } else {
        toast.error(
          result.error || "Failed to delete notification. Please try again."
        )
      }
    } catch (error) {
      console.error("Delete notification error:", error)
      toast.error("An unexpected error occurred while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="size-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Delete Notification
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{item.title}&quot;
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse items-stretch gap-2 pt-3 sm:flex-row sm:items-center sm:justify-end">
          <AlertDialogCancel
            disabled={isDeleting}
            className="w-full text-xs sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
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
                Delete Notification
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
