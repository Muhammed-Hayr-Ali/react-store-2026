/**
 * @file components/auth/reset-password-form.tsx
 * @description Password update form verifying token credentials with Section 12 error handling.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"

import { confirmPasswordReset } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { IconInput } from "@/components/ui/icon-input"
import { getActionErrorKey } from "@/lib/actions/error-keys"

// Define the client-side schema separately because the shared schema uses a refinement.
const clientResetSchema = z
  .object({
    password: z.string().min(6, "PASSWORD_TOO_SHORT"),
    confirmPassword: z.string().min(1, "CONFIRM_PASSWORD_REQUIRED"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORDS_DO_NOT_MATCH",
    path: ["confirmPassword"],
  })

type ClientResetFormValues = z.infer<typeof clientResetSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  // Load translations and navigation for the reset flow.
  const t = useTranslations("ResetPasswordForm")
  const tErrors = useTranslations("ActionErrors")
  const router = useRouter()

  // Track password visibility and server-side errors.
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Configure password validation and initial form values.
  const form = useForm<ClientResetFormValues>({
    resolver: zodResolver(clientResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  // Submit the new password and handle validation or token errors.
  async function onSubmit(data: ClientResetFormValues) {
    setErrorMessage(null)

    const result = await confirmPasswordReset({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })

    if (result.success) {
      toast.success(t("PASSWORD_UPDATED_TOAST"))
      router.refresh()
      router.replace(appRoutes.auth.login)
      return
    }

    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, msgs]) => {
        form.setError(field as keyof ClientResetFormValues, {
          message: msgs[0],
        })
      })
      return
    }

    if (result.error === "VERIFY_RESET_TOKEN_ERROR") {
      setErrorMessage(t("INVALID_OR_EXPIRED_TOKEN_ERROR"))
    } else {
      setErrorMessage(
        result.error
          ? tErrors(getActionErrorKey(result.error))
          : t("GENERIC_ERROR")
      )
    }
  }

  // Render password fields, error feedback, and the submit action.
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

        {/* New Password Field */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="text-xs">
                {t("PASSWORD_LABEL")}
              </FieldLabel>
              <IconInput
                {...field}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("PASSWORD_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                className="h-9 text-xs"
                prefixIcon={
                  <LockIcon className="size-4 text-muted-foreground" />
                }
                suffixIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="size-7 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-4" />
                    ) : (
                      <EyeOffIcon className="size-4" />
                    )}
                    <span className="sr-only">
                      {showPassword
                        ? t("HIDE_PASSWORD_SR")
                        : t("SHOW_PASSWORD_SR")}
                    </span>
                  </Button>
                }
              />
              {fieldState.invalid && (
                <ActionFieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Confirm Password Field */}
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword" className="text-xs">
                {t("CONFIRM_PASSWORD_LABEL")}
              </FieldLabel>
              <IconInput
                {...field}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("PASSWORD_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                className="h-9 text-xs"
                prefixIcon={
                  <LockIcon className="size-4 text-muted-foreground" />
                }
                suffixIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="size-7 cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="size-4" />
                    ) : (
                      <EyeOffIcon className="size-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword
                        ? t("HIDE_PASSWORD_SR")
                        : t("SHOW_PASSWORD_SR")}
                    </span>
                  </Button>
                }
              />
              {fieldState.invalid && (
                <ActionFieldError errors={[fieldState.error]} />
              )}
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
                <Spinner className="me-2 size-3.5" />
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
