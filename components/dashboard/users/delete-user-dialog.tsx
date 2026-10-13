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
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { deleteUser } from "@/lib/actions/users/mutations/delete-user"
import { getActionErrorKey } from "@/lib/actions/error-keys"

export interface DeleteUserDialogProps {
  userId: string
  userName: string
  children?: React.ReactElement
  onDeleted?: (deletedId: string) => void
}

export function DeleteUserDialog({
  userId,
  userName,
  children,
  onDeleted,
}: DeleteUserDialogProps) {
  // Resolve translations and track dialog, confirmation, and pending states.
  const t = useTranslations("UsersManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(false)
  const [confirmName, setConfirmName] = React.useState("")

  // Delete the user after the entered name matches the account name.
  const handleDelete = () => {
    if (confirmName !== userName) return

    startTransition(async () => {
      try {
        const res = await deleteUser({ userId })

        if (res.success) {
          setIsOpen(false)
          toast.success(t("DELETE_SUCCESS_TOAST", { name: userName }))
          onDeleted?.(userId)
        } else {
          toast.error(
            res.error
              ? tErrors(getActionErrorKey(res.error))
              : t("DELETE_ERROR_TOAST")
          )
        }
      } catch {
        toast.error(t("GENERIC_ERROR_TOAST"))
      }
    })
  }

  // Enable deletion only when the confirmation name matches.
  const isConfirmValid = confirmName === userName

  // Render the confirmation dialog and name-verification form.
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open || !isPending) {
          setIsOpen(open)
          if (!open) {
            // Clear the confirmation field after the closing animation.
            setTimeout(() => setConfirmName(""), 200)
          }
        }
      }}
    >
      <AlertDialogTrigger
        render={
          children ?? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon className="size-3.5" />
              <span>{t("DELETE_ACCOUNT")}</span>
            </Button>
          )
        }
      />

      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("DELETE_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("DELETE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{userName}&quot;
            </span>
            ؟ {t("DELETE_DIALOG_WARNING")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Account-name confirmation field */}
        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-2 py-2">
            <Label
              htmlFor="confirm-name"
              className="text-xs text-muted-foreground"
            >
              {t("TYPE_NAME_TO_CONFIRM")}{" "}
              <span className="font-semibold text-foreground select-all">
                {userName}
              </span>
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={isPending}
              placeholder={t("CONFIRM_NAME_PLACEHOLDER")}
              autoComplete="off"
              className="h-9 text-xs"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="mt-0 text-xs">
            {t("CANCEL_BUTTON")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !isConfirmValid}
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteUserDialog
