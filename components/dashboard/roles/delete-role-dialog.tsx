"use client"

/**
 * @file components/dashboard/roles/delete-role-dialog.tsx
 * @description Confirmation dialog for deleting an unassigned role.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { deleteRole } from "@/lib/actions/role/mutations/delete-role"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface DeleteRoleDialogProps {
  roleId: string
  roleName: string
  children: React.ReactNode
  onDeleted?: (deletedId: string) => void
}

export function DeleteRoleDialog({
  roleId,
  roleName,
  children,
  onDeleted,
}: DeleteRoleDialogProps) {
  // Resolve translations and track dialog, confirmation, and pending states.
  const t = useTranslations("RolesManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(false)
  const [confirmName, setConfirmName] = React.useState("")

  // Delete the role after the entered name matches the role name.
  const handleDelete = () => {
    if (confirmName !== roleName) return

    startTransition(async () => {
      try {
        const result = await deleteRole({ roleId })

        if (result.success) {
          setIsOpen(false)
          toast.success(t("ROLE_DELETED_SUCCESS", { name: roleName }))
          onDeleted?.(roleId)
          return
        }

        toast.error(
          result.error === "ROLE_IN_USE"
            ? t("ROLE_IN_USE_ERROR")
            : tErrors(getActionErrorKey(result.error))
        )
      } catch {
        toast.error(t("ROLE_DELETE_ERROR"))
      }
    })
  }

  // Enable deletion only when the confirmation name matches.
  const isConfirmValid = confirmName === roleName

  // Render a controlled typed-name confirmation dialog for role deletion.
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open || !isPending) {
          setIsOpen(open)
          if (!open) {
            setTimeout(() => setConfirmName(""), 200)
          }
        }
      }}
    >
      {children}
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("DELETE_ROLE_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("DELETE_ROLE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{roleName}&quot;
            </span>{" "}
            {t("DELETE_ROLE_DIALOG_WARNING")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-2 py-2">
            <Label
              htmlFor={`confirm-role-${roleId}`}
              className="text-xs text-muted-foreground"
            >
              {t("TYPE_ROLE_NAME_TO_CONFIRM")}{" "}
              <span className="font-semibold text-foreground select-all">
                {roleName}
              </span>
            </Label>
            <Input
              id={`confirm-role-${roleId}`}
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              disabled={isPending}
              placeholder={t("CONFIRM_ROLE_NAME_PLACEHOLDER")}
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
