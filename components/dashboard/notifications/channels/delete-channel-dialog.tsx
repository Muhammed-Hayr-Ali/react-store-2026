"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NotificationChannelRecord } from "@/lib/actions/notifications/types"
import { deleteNotificationChannel } from "@/lib/actions/notifications"

interface DeleteChannelDialogProps {
  channel: NotificationChannelRecord | null
  trigger?: React.ReactNode
  onSuccess?: (deletedId: string) => void
}

export function DeleteChannelDialog({
  channel,
  trigger,
  onSuccess,
}: DeleteChannelDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!channel) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteNotificationChannel(channel.id)
      if (!res.success) {
        toast.error(
          res.error === "CANNOT_DELETE_MANDATORY_CHANNEL"
            ? "Mandatory channels cannot be deleted."
            : res.error || "Failed to delete notification channel"
        )
        return
      }
      toast.success("Notification channel deleted successfully")
      onSuccess?.(channel.id)
      setOpen(false)
    } catch {
      toast.error("An unexpected error occurred while deleting")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive"
          >
            <Trash2Icon className="size-3.5" />
            <span>Delete Channel</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <DialogTitle className="text-base font-semibold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to delete &quot;
            <span className="font-semibold text-foreground">
              {channel.name}
            </span>
            &quot;? All user subscriptions to this topic will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
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
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}