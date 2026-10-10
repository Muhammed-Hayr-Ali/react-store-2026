"use client"

/**
 * @file components/dashboard/users/delete-user-dialog.tsx
 * @description Uncontrolled deletion confirmation dialog for user accounts.
 * Fully compliant with React 19 useTransition, lifecycle locking during mutations,
 * RTL-first styling, and zero any typing.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { AlertTriangleIcon, Trash2Icon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deleteUser } from "@/lib/actions/users/mutations/delete-user"

export interface DeleteUserDialogProps {
  userId: string
  userName: string
  children?: React.ReactNode
  onDeleted?: (deletedId: string) => void
}

export function DeleteUserDialog({
  userId,
  userName,
  children,
  onDeleted,
}: DeleteUserDialogProps) {
  const t = useTranslations("UsersManagement")
  const [isPending, startTransition] = React.useTransition()
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteUser(userId)

        if (res.success) {
          toast.success(t("DELETE_SUCCESS_TOAST", { name: userName }))
          onDeleted?.(userId)
          closeRef.current?.click() // Programmatic uncontrolled dismissal
        } else {
          toast.error(res.error || t("DELETE_ERROR_TOAST"))
        }
      } catch {
        toast.error(t("GENERIC_ERROR_TOAST"))
      }
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-3.5" />
            <span>{t("DELETE_ACCOUNT")}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <DialogHeader className="gap-2 text-start">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <DialogTitle className="text-base font-semibold text-foreground">
            {t("DELETE_DIALOG_TITLE")}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {t("DELETE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{userName}&quot;
            </span>
            ؟ {t("DELETE_DIALOG_WARNING")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-xs"
            >
              {t("CANCEL_BUTTON")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs shadow-xs"
          >
            {isPending ? (
              <>
                <Spinner className="me-1.5 size-3.5" />
                {t("DELETING_BUTTON")}
              </>
            ) : (
              t("CONFIRM_DELETE_BUTTON")
            )}
          </Button>
          {/* Programmatic close ref invoked strictly on successful deletion */}
          <DialogClose ref={closeRef} className="hidden" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteUserDialog
