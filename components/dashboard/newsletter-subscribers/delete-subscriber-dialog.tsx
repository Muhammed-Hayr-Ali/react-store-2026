"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

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
import type { NewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/types"

interface DeleteSubscriberDialogProps {
  subscriber: NewsletterSubscriber
  isDeleting: boolean
  onDelete: (id: string) => void
  trigger: React.ReactNode
}

export function DeleteSubscriberDialog({
  subscriber,
  isDeleting,
  onDelete,
  trigger,
}: DeleteSubscriberDialogProps) {
  const t = useTranslations("NewsletterSubscribersManagement")
  const [open, setOpen] = React.useState(false)
  const [confirmEmail, setConfirmEmail] = React.useState("")

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!isDeleting) {
          setOpen(value)
          if (!value) setConfirmEmail("")
        }
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isDeleting) event.preventDefault()
        }}
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("DELETE_DIALOG_TITLE")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t("DELETE_DIALOG_DESCRIPTION")}{" "}
            <span className="font-semibold wrap-break-word text-foreground">
              &quot;{subscriber.email}&quot;
            </span>
            . {t("DELETE_DIALOG_WARNING")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="min-h-0 overflow-y-auto">
          <div className="space-y-2 py-2">
            <Label
              htmlFor={`confirm-email-${subscriber.id}`}
              className="text-xs text-muted-foreground"
            >
              {t("TYPE_EMAIL_TO_CONFIRM")}{" "}
              <span className="font-semibold text-foreground select-all">
                {subscriber.email}
              </span>
            </Label>
            <Input
              id={`confirm-email-${subscriber.id}`}
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
              disabled={isDeleting}
              placeholder={t("CONFIRM_EMAIL_PLACEHOLDER")}
              autoComplete="off"
              className="h-9 text-xs"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="mt-0 text-xs"
            onClick={() => setConfirmEmail("")}
          >
            {t("CANCEL_BUTTON")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || confirmEmail !== subscriber.email}
            onClick={() => onDelete(subscriber.id)}
            className="text-xs shadow-xs"
          >
            {isDeleting ? (
              <>
                <Spinner className="me-1.5 size-3.5" />
                {t("DELETING_BUTTON")}
              </>
            ) : (
              t("DELETE_ACTION")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}