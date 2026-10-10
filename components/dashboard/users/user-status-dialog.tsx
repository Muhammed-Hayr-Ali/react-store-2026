"use client"

/**
 * @file components/dashboard/users/user-status-dialog.tsx
 * @description Uncontrolled dialog for updating account accessibility and moderation status.
 * Compliant with React 19 useTransition, lifecycle locking, RTL-first layout, and next-intl.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ShieldAlertIcon, CheckCircle2Icon } from "lucide-react"

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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminUserSummary, UserStatus } from "@/lib/actions/users/types"
import { updateUserStatus } from "@/lib/actions/users/mutations/update-user-status"

export interface UserStatusDialogProps {
  user: AdminUserSummary
  children?: React.ReactNode
  onSuccess?: (
    userId: string,
    newStatus: UserStatus,
    banReason?: string
  ) => void
}

export function UserStatusDialog({
  user,
  children,
  onSuccess,
}: UserStatusDialogProps) {
  const t = useTranslations("UsersManagement")
  const [status, setStatus] = React.useState<UserStatus>(user.status)
  const [banReason, setBanReason] = React.useState(user.ban_reason || "")
  const [isPending, startTransition] = React.useTransition()
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        const res = await updateUserStatus({
          userId: user.id,
          status,
          banReason: status === "banned" ? banReason : undefined,
        })

        if (res.success) {
          toast.success(t("STATUS_UPDATED_TOAST", { status }))
          onSuccess?.(user.id, status, banReason)
          closeRef.current?.click() // Programmatic uncontrolled dismissal
        } else {
          toast.error(res.error || t("FAILED_TO_UPDATE_STATUS"))
        }
      } catch {
        toast.error(t("GENERIC_ERROR_TOAST"))
      }
    })
  }

  const userDisplayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email ||
    t("ANONYMOUS_USER")

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <ShieldAlertIcon className="size-3.5 text-amber-500" />
            <span>{t("CHANGE_STATUS_ACTION")}</span>
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
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <ShieldAlertIcon className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {t("STATUS_DIALOG_TITLE")}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {t("STATUS_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold text-foreground">
              &quot;{userDisplayName}&quot;
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-start">
          <Field>
            <FieldLabel className="text-xs">
              {t("ACCOUNT_STATUS_LABEL")}
            </FieldLabel>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as UserStatus)}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={t("SELECT_STATUS_PLACEHOLDER")} />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="active">{t("STATUS_ACTIVE_OPT")}</SelectItem>
                <SelectItem value="suspended">
                  {t("STATUS_SUSPENDED_OPT")}
                </SelectItem>
                <SelectItem value="banned" className="text-destructive">
                  {t("STATUS_BANNED_OPT")}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {status === "banned" && (
            <Field>
              <FieldLabel className="text-xs">
                {t("BAN_REASON_LABEL")}
              </FieldLabel>
              <Input
                placeholder={t("BAN_REASON_PLACEHOLDER")}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                disabled={isPending}
                className="h-9 text-xs"
              />
            </Field>
          )}
        </div>

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
            onClick={handleUpdate}
            disabled={isPending}
            className="text-xs shadow-xs"
          >
            {isPending ? (
              <>
                <Spinner className="me-1.5 size-3.5" />
                {t("SAVING_BUTTON")}
              </>
            ) : (
              <>
                <CheckCircle2Icon className="me-1.5 size-3.5" />
                {t("SAVE_CHANGES_BUTTON")}
              </>
            )}
          </Button>
          <DialogClose ref={closeRef} className="hidden" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserStatusDialog
