"use client"

import { Send } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { createNewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/mutations/create-newsletter-subscriber"
import {
  newsletterSubscriberSchema,
  type NewsletterSubscriberInput,
} from "@/lib/actions/newsletter_subscribers/schemas"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const t = useTranslations("NewsletterSection")
  const tErrors = useTranslations("ActionErrors")
  const locale = useLocale()

  const form = useForm<NewsletterSubscriberInput>({
    resolver: zodResolver(newsletterSubscriberSchema),
    defaultValues: { email: "" },
  })
  const { isSubmitting } = form.formState

  async function onSubmit(data: NewsletterSubscriberInput) {
    try {
      const result = await createNewsletterSubscriber({ ...data, locale })

      if (result.success) {
        toast.success(t("SUBSCRIBE_SUCCESS"))
        form.reset()
        return
      }

      const validationMessage =
        result.error === "VALIDATION_ERROR" && result.details
          ? Object.values(result.details).flat()[0]
          : undefined
      toast.error(tErrors(getActionErrorKey(validationMessage ?? result.error)))
    } catch {
      toast.error(tErrors("UNEXPECTED_ERROR"))
    }
  }

  function onInvalid() {
    const message = form.formState.errors.email?.message
    toast.error(tErrors(getActionErrorKey(message)))
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          {t("TITLE")}
        </h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("DESCRIPTION")}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex items-center gap-1.5 pt-1"
        noValidate
      >
        <Input
          {...form.register("email")}
          type="email"
          placeholder={t("EMAIL_PLACEHOLDER")}
          autoComplete="email"
          disabled={isSubmitting}
          required
          aria-invalid={Boolean(form.formState.errors.email)}
          className="h-7.5 flex-1 rounded-xl border-0 bg-secondary text-secondary-foreground focus-visible:ring-0"
        />

        <Button
          type="submit"
          variant="secondary"
          size="icon-lg"
          disabled={isSubmitting}
          aria-label={t("SUBSCRIBE_ARIA_LABEL")}
        >
          {isSubmitting ? <Spinner /> : <Send />}
          <span className="sr-only">{t("SUBSCRIBE_BUTTON")}</span>
        </Button>
      </form>
    </div>
  )
}
