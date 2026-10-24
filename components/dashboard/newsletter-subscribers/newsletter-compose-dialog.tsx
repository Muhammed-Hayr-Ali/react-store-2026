"use client"

/**
 * @file components/dashboard/newsletter-subscribers/newsletter-compose-dialog.tsx
 * @description Dialog component for composing and sending newsletter emails to subscribers.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { sendNewsletterEmail } from "@/lib/actions/newsletter_subscribers/mutations/send-newsletter-email"
import { NEWSLETTER_EMAIL_BATCH_LIMIT } from "@/lib/actions/newsletter_subscribers/schemas"
import type { NewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/types"
import type { AppLocale } from "@/i18n/routing"
import { LoaderCircleIcon } from "lucide-react"

interface NewsletterComposeDialogProps {
  subscriberIds: string[]
  locale: AppLocale
  children: React.ReactElement
  onSent: (subscriberIds: string[]) => void
  onPartialFailure: (
    attemptedIds: string[],
    failedSubscriberIds: string[]
  ) => void
  onRecipientsChanged: (
    invalidIds: string[],
    inactiveIds: string[],
    missingIds: string[]
  ) => void
}

export function NewsletterComposeDialog({
  subscriberIds,
  locale,
  children,
  onSent,
  onPartialFailure,
  onRecipientsChanged,
}: NewsletterComposeDialogProps) {
  const t = useTranslations("NewsletterSubscribersManagement")
  const tErrors = useTranslations("ActionErrors")
  const [open, setOpen] = React.useState(false)

  // تتبع الفشلات الحية أثناء عملية الإرسال الجزئي دون الحاجة لـ useEffect للـ props
  const [failedIdsState, setFailedIdsState] = React.useState<string[] | null>(
    null
  )

  const [emailLocale, setEmailLocale] = React.useState<AppLocale>(locale)
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [isSending, startSending] = React.useTransition()

  // القائمة الفعلية للمستلمين (تعتمد على الفشل الجزئي أو الـ props الأساسية)
  const recipientIds = failedIdsState ?? subscriberIds

  function handleOpenChange(nextOpen: boolean) {
    if (isSending) return
    if (nextOpen) {
      setFailedIdsState(null) // إعادة ضبط عند الفتح
      setEmailLocale(locale)
      setSubject(t("DEFAULT_SUBJECT"))
      setMessage("")
    }
    setOpen(nextOpen)
  }

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startSending(async () => {
      try {
        const result = await sendNewsletterEmail({
          subscriberIds: recipientIds,
          subject,
          message,
          locale: emailLocale,
        })

        if (result.success) {
          toast.success(
            t("SEND_SUCCESS_TOAST", { count: result.data.sentCount })
          )
          onSent(recipientIds)
          setOpen(false)
          return
        }

        if (result.error === "NEWSLETTER_EMAIL_PARTIAL_FAILURE") {
          const failedIds = result.failedSubscriberIds ?? []
          setFailedIdsState(failedIds)
          onPartialFailure(recipientIds, failedIds)
          toast.error(
            t("SEND_PARTIAL_FAILURE", {
              sent: result.sentCount ?? 0,
              failed: result.failedCount ?? failedIds.length,
            })
          )
          return
        }

        if (result.error === "NEWSLETTER_RECIPIENTS_CHANGED") {
          const invalidIds = result.invalidSubscriberIds ?? recipientIds
          const inactiveIds = result.inactiveSubscriberIds ?? []
          const missingIds = result.missingSubscriberIds ?? []
          onRecipientsChanged(invalidIds, inactiveIds, missingIds)
          setFailedIdsState([])
        }

        toast.error(tErrors(getActionErrorKey(result.error)))
      } catch {
        toast.error(tErrors("UNEXPECTED_ERROR"))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (isSending) event.preventDefault()
        }}
      >
        <DialogHeader className="text-start">
          <DialogTitle className="text-base font-bold">
            {t("COMPOSE_TITLE")}
          </DialogTitle>
          <DialogDescription>
            {t("COMPOSE_DESCRIPTION", { count: recipientIds.length })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newsletter-subject">{t("SUBJECT_LABEL")}</Label>
            <Input
              id="newsletter-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={200}
              required
              disabled={isSending}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newsletter-email-locale">
              {t("EMAIL_LANGUAGE_LABEL")}
            </Label>
            <select
              id="newsletter-email-locale"
              value={emailLocale}
              onChange={(event) =>
                setEmailLocale(event.target.value === "ar" ? "ar" : "en")
              }
              disabled={isSending}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="ar">{t("ARABIC")}</option>
              <option value="en">{t("ENGLISH")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newsletter-message">{t("MESSAGE_LABEL")}</Label>
            <Textarea
              id="newsletter-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              rows={7}
              required
              disabled={isSending}
              placeholder={t("MESSAGE_PLACEHOLDER")}
              className="resize-y text-xs"
            />
            <p className="text-end text-[11px] text-muted-foreground">
              {message.length}/5000
            </p>
          </div>
          <Alert>
            <AlertDescription>
              {t("UNSUBSCRIBE_FOOTER_NOTICE")}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSending}
              onClick={() => setOpen(false)}
              className="h-9 gap-1.5 text-xs"
            >
              {t("CANCEL_BUTTON")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSending ||
                !subject.trim() ||
                !message.trim() ||
                recipientIds.length === 0 ||
                recipientIds.length > NEWSLETTER_EMAIL_BATCH_LIMIT
              }
              className="h-9 gap-1.5 text-xs"
            >
              {isSending && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}

              {isSending
                ? t("SENDING_BUTTON")
                : t("SEND_BUTTON", { count: recipientIds.length })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { NewsletterSubscriber }
