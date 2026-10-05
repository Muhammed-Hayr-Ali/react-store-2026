"use client"

import * as React from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AdminUserSummary } from "@/lib/actions/users/types"
import { deleteUser } from "@/lib/actions/users/mutations/delete-user"

interface DeleteUserDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUserSummary | null
  onSuccess: (deletedId: string) => void
}

export function DeleteUserDialog({
  isOpen,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!user) return
    setIsDeleting(true)

    try {
      const res = await deleteUser(user.id)

      if (res.success) {
        toast.success("User account deleted permanently.")
        onSuccess(user.id)
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to delete user account.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsDeleting(false)
    }
  }

  const userDisplayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.email ||
      "User"
    : ""

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to permanently delete the account for{" "}
            <span className="font-semibold text-foreground">
              &quot;{userDisplayName}&quot;
            </span>
            ? This action will completely remove the user from authentication
            and database records.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <AlertDialogCancel
            disabled={isDeleting}
            className="w-full text-xs sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
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
              "Delete Account"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
