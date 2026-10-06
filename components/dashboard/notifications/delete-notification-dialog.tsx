"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlertTriangleIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AdminNotificationRecord } from "@/lib/actions/notifications/types"
import {
  deleteNotification,
  deleteBatchNotifications,
} from "@/lib/actions/notifications/mutations/delete"

interface DeleteNotificationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item:
    | (AdminNotificationRecord & {
        isBroadcastGroup?: boolean
        recipientCount?: number
        groupedIds?: string[]
      })
    | null
  onSuccess: (deletedId: string) => void
}

export default function DeleteNotificationDialog({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: DeleteNotificationDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!item) return null

  const isBroadcast = Boolean(item.isBroadcastGroup && item.groupedIds?.length)
  const count = item.groupedIds?.length || 1

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      if (isBroadcast && item.groupedIds) {
        // حذف جماعي لكافة السجلات المتطابقة
        const res = await deleteBatchNotifications(item.groupedIds)
        if (!res.success) {
          toast.error(res.error || "Failed to delete broadcast notifications")
          return
        }
        toast.success(
          `Deleted broadcast notification for ${count} users successfully`
        )
      } else {
        // حذف فردي
        const res = await deleteNotification(item.id)
        if (!res.success) {
          toast.error(res.error || "Failed to delete notification")
          return
        }
        toast.success("Notification deleted successfully")
      }

      onSuccess(item.id)
      onOpenChange(false)
    } catch {
      toast.error("An unexpected error occurred while deleting")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <DialogTitle className="text-base font-semibold">
            {isBroadcast
              ? "Delete Broadcast Notification"
              : "Delete Notification"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {isBroadcast ? (
              <>
                Are you sure you want to delete this broadcast? This action will
                permanently remove{" "}
                <span className="font-semibold text-foreground">
                  {count} notification records
                </span>{" "}
                sent to all recipients.
              </>
            ) : (
              <>
                Are you sure you want to delete the notification &quot;
                <span className="font-semibold text-foreground">
                  {item.title}
                </span>
                &quot;? This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-xs"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-1.5 size-3.5" />
                Deleting...
              </>
            ) : (
              `Delete ${isBroadcast ? `(${count})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
