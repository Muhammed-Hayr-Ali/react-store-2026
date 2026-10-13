"use client"

/**
 * @file components/dashboard/logout-alert.tsx
 * @description Confirms and performs the current user's sign-out action.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "../ui/spinner"
import { signOut } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { useRouter } from "next/navigation"

interface LogoutAlertDialogProps {
  children: React.ReactElement
}

export function LogoutAlertDialog({ children }: LogoutAlertDialogProps) {
  const t = useTranslations("DashboardSidebar")
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = await signOut()
        if (!result.success) {
          toast.error(t("LOGOUT_ERROR"))
          return
        }

        setIsOpen(false)
        router.replace(appRoutes.home)
        router.refresh()
      } catch {
        toast.error(t("LOGOUT_ERROR"))
      }
    })
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open || !isPending) setIsOpen(open)
      }}
    >
      <AlertDialogTrigger render={children} />
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <LogOutIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("LOGOUT_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("LOGOUT_DIALOG_DESCRIPTION")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="mt-0 text-xs">
            {t("CANCEL_BUTTON")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
            className="text-xs shadow-xs"
          >
            {isPending ? (
              <>
                <Spinner className="me-1.5 size-3.5" />
                {t("LOGGING_OUT")}
              </>
            ) : (
              t("LOGOUT_CONFIRM")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
