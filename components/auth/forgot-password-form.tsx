/**
 * @file components/auth/forgot-password-form.tsx
 * @description Accessible password reset request form adhering to Section 12 feedback standards.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { MailIcon, AlertCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CustomInput } from "@/components/ui/custom-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"
import { ResetPasswordSuccess } from "./reset-password-success"

import {
  requestPasswordReset,
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPasswordForm")
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(data: RequestPasswordResetInput) {
    setErrorMessage(null)
    const result = await requestPasswordReset(data)

    if (result.success) {
      setSubmittedEmail(data.email)
      return
    }

    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, msgs]) => {
        form.setError(field as keyof RequestPasswordResetInput, {
          message: msgs[0],
        })
      })
      return
    }

    setErrorMessage(result.error || t("GENERIC_ERROR"))
  }

  if (submittedEmail) {
    return (
      <ResetPasswordSuccess
        email={submittedEmail}
        onRetry={() => {
          setSubmittedEmail(null)
          form.reset()
        }}
      />
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <FieldGroup className="space-y-4">
        <AuthHeader
          title={t("TITLE")}
          description={t("SUBTITLE")}
          linkText={t("SIGN_IN_LINK")}
          linkHref={appRoutes.auth.login}
        />

        {/* Section 12 Form-Level Server Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="relative pe-9">
            <AlertCircleIcon className="size-4 shrink-0" />
            <AlertTitle className="text-xs font-semibold">
              {t("ALERT_TITLE")}
            </AlertTitle>
            <AlertDescription className="text-xs text-destructive-foreground/90">
              {errorMessage}
            </AlertDescription>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="absolute top-3 inset-e-3 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{t("DISMISS_ALERT_SR")}</span>
            </button>
          </Alert>
        )}

        {/* Email Field */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email" className="text-xs">
                {t("EMAIL_LABEL")}
              </FieldLabel>
              <CustomInput
                {...field}
                id="email"
                type="email"
                placeholder={t("EMAIL_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                className="h-9 text-xs"
                prefixIcon={<MailIcon className="size-4 text-muted-foreground" />}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Submit Action */}
        <Field className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full text-xs font-medium uppercase shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-3.5 me-2" />
                <span>{t("SUBMITTING_BUTTON")}</span>
              </>
            ) : (
              t("SUBMIT_BUTTON")
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}