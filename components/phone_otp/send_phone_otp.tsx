/**
 * @file components/authentication/sign-up-form.tsx
 * @description Accessible, client-side phone sign-up form utilizing react-phone-number-input
 * for dynamic international formatting and validation.
 */

"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css" // Import default styling (can be overridden with Tailwind)
import { AlertCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  sendPhoneOtp,
  sendOtpSchema,
  type SendOtpFormValues,
} from "@/lib/actions/phone-otps"
import { appRoutes } from "@/lib/config/app-routes"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { AuthHeader } from "../authentication/auth-header"

export function SendPhoneOtp() {
  const t = useTranslations("SendPhoneOtp")
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || appRoutes.home

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const form = useForm<SendOtpFormValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      phone: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: SendOtpFormValues) {
    setErrorMessage(null)
    const result = await sendPhoneOtp(data, locale)
    if (!result.success) {
      console.error(
        "sendPhoneOtp failed with error:",
        result.error,
        "and details:",
        result.details
      )
      const errorKey = getActionErrorKey(result.error)
      setErrorMessage(`ERRORS.${errorKey}`)
      return
    }

    if (result.success && result.data) {
      router.refresh()
      router.replace(
        `/${locale}/auth/phone-verify?phone=${encodeURIComponent(result.data.phoneNumber)}&redirect=${encodeURIComponent(redirectTarget)}`
      )
      return
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <FieldGroup className="space-y-4">
        <AuthHeader
          // Verifcation You Phone Number
          title={t("WELCOME_TITLE")}
          description={t("SIGN_UP_SUBTITLE")}
          linkText={t("SIGN_IN_LINK")}
          linkHref={appRoutes.auth.signin}
        />

        {errorMessage && (
          <Alert variant="destructive" className="relative pe-9">
            <AlertCircleIcon className="size-4 shrink-0" />
            <AlertDescription className="text-destructive-foreground/90 text-xs">
              {errorMessage}
            </AlertDescription>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="absolute inset-e-3 top-1.5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{t("DISMISS_ALERT_SR")}</span>
            </button>
          </Alert>
        )}

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone" className="text-xs">
                {t("PHONE_LABEL")}
              </FieldLabel>
              <div className="phone-input-wrapper [&_.PhoneInputCountry]:me-2 [&_input]:h-9 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-input [&_input]:bg-background [&_input]:px-3 [&_input]:font-mono [&_input]:text-xs [&_input]:shadow-xs [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-ring [&_input]:focus-visible:outline-none">
                <PhoneInput
                  international
                  defaultCountry="SY"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  id="phone"
                  placeholder={t("PHONE_PLACEHOLDER")}
                />
              </div>
              {fieldState.invalid && (
                <ActionFieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {errors.root && (
          <ActionFieldError errors={[{ message: errors.root.message }]} />
        )}

        <Field className="pt-1">
          <div className="relative w-full">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 w-full text-xs font-medium uppercase shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="me-2 size-3.5" />
                  <span>{t("SIGN_UP_SUBMITTING")}</span>
                </>
              ) : (
                t("SIGN_UP_BUTTON")
              )}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
