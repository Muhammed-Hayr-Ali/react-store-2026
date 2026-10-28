"use client"

/**
 * @file components/dashboard/logout-alert.tsx
 * @description Confirms and performs the current user's sign-out action.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { LoaderCircleIcon } from "lucide-react"

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
import { signOut } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

interface LogoutAlertDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
}

export function LogoutAlertDialog({
  open,
  onOpenChange,
}: LogoutAlertDialogProps) {
  const t = useTranslations("DashboardSidebar")
  const [isPending, startTransition] = React.useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = await signOut()
        if (!result.success) {
          toast.error(t("LOGOUT_ERROR"))
          return
        }

        onOpenChange(false)
        window.location.href = appRoutes.home
      } catch {
        toast.error(t("LOGOUT_ERROR"))
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("LOGOUT_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("LOGOUT_DIALOG_DESCRIPTION")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="h-9 text-xs">
            {t("CANCEL_BUTTON")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
            className="h-9 gap-1.5 text-xs"
          >
            {isPending && (
              <LoaderCircleIcon className="size-3.5 animate-spin" />
            )}

            {isPending ? t("LOGGING_OUT") : t("LOGOUT_CONFIRM")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
