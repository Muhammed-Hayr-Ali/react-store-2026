"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { unsubscribeNewsletter } from "@/lib/actions/newsletter_subscribers/mutations/unsubscribe-newsletter"
import { NEWSLETTER_UNSUBSCRIBE_REASON_CODES } from "@/lib/actions/newsletter_subscribers/schemas"

interface NewsletterUnsubscribeFormProps {
  email: string | null
  token: string | null
}

export function NewsletterUnsubscribeForm({
  email,
  token,
}: NewsletterUnsubscribeFormProps) {
  const t = useTranslations("NewsletterUnsubscribe")
  const tErrors = useTranslations("ActionErrors")
  const [reasons, setReasons] = React.useState<string[]>([])
  const [otherReason, setOtherReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isComplete, setIsComplete] = React.useState(false)
  const [isInvalid, setIsInvalid] = React.useState(!token || !email)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || isSubmitting) return

    if (reasons.includes("OTHER") && !otherReason.trim()) {
      toast.error(t("OTHER_REASON_REQUIRED"))
      return
    }

    setIsSubmitting(true)
    try {
      const result = await unsubscribeNewsletter({
        token,
        reasons,
        otherReason: otherReason.trim(),
      })

      if (result.success) {
        setIsComplete(true)
        toast.success(t("SUCCESS_TITLE"))
        return
      }

      if (result.error === "NEWSLETTER_UNSUBSCRIBE_LINK_EXPIRED") {
        setIsInvalid(true)
        toast.error(t("INVALID_TITLE"))
        return
      }

      const validationMessage =
        result.error === "VALIDATION_ERROR" && result.details
          ? Object.values(result.details).flat()[0]
          : undefined
      toast.error(
        validationMessage === "NEWSLETTER_OTHER_REASON_REQUIRED"
          ? t("OTHER_REASON_REQUIRED")
          : tErrors(result.error)
      )
    } catch {
      toast.error(t("FAILURE"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {isComplete
          ? t("SUCCESS_TITLE")
          : isInvalid
            ? t("INVALID_TITLE")
            : t("TITLE")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isComplete
          ? t("SUCCESS_DESCRIPTION")
          : isInvalid
            ? t("INVALID_DESCRIPTION")
            : t("DESCRIPTION")}
      </p>

      {token && email && !isInvalid && !isComplete && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium">{t("EMAIL_LABEL")}</p>
            <p
              dir="ltr"
              className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              {email}
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium">
              {t("REASONS_LABEL")}
            </legend>
            {NEWSLETTER_UNSUBSCRIBE_REASON_CODES.map((reason) => (
              <div key={reason} className="flex items-center gap-2">
                <Checkbox
                  id={`newsletter-reason-${reason}`}
                  checked={reasons.includes(reason)}
                  onCheckedChange={(checked) => {
                    setReasons((current) =>
                      checked
                        ? [...current, reason]
                        : current.filter((item) => item !== reason)
                    )
                  }}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor={`newsletter-reason-${reason}`}
                  className="cursor-pointer text-sm"
                >
                  {t(reason)}
                </label>
              </div>
            ))}
          </fieldset>

          {reasons.includes("OTHER") && (
            <Textarea
              value={otherReason}
              onChange={(event) => setOtherReason(event.target.value)}
              placeholder={t("OTHER_REASON_PLACEHOLDER")}
              maxLength={500}
              disabled={isSubmitting}
              aria-label={t("OTHER_REASON_PLACEHOLDER")}
            />
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Spinner className="me-2 size-4" />
                {t("SUBMITTING")}
              </>
            ) : (
              t("SUBMIT")
            )}
          </Button>
        </form>
      )}
    </section>
  )
}
