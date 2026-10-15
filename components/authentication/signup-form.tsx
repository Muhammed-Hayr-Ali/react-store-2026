/**
 * @file components/auth/signup-form.tsx
 * @description Customer registration form with client validation,
 * inline field bindings, and Section 12 destructive alert management.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { IconInput } from "@/components/ui/icon-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signUpWithPassword,
  signUpWithPasswordSchema,
  type SignUpWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { getActionErrorKey } from "@/lib/actions/error-keys"

export function SignUpForm() {
  // Load translations and navigation for the registration flow.
  const t = useTranslations("SignUpForm")
  const tErrors = useTranslations("ActionErrors")
  const locale = useLocale()
  const router = useRouter()

  // Track password visibility and server-side errors.
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Configure registration validation and initial form values.
  const form = useForm<SignUpWithPasswordInput>({
    resolver: zodResolver(signUpWithPasswordSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  // Create the account and display field or account-level errors.
  async function onSubmit(data: SignUpWithPasswordInput) {
    setErrorMessage(null)
    const result = await signUpWithPassword(data, locale)

    if (result.success) {
      router.refresh()
      router.replace(appRoutes.home)
      return
    }

    // Intercept Server Action validation errors and bind directly to form fields
    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, msgs]) => {
        form.setError(field as keyof SignUpWithPasswordInput, {
          message: msgs[0],
        })
      })
      return
    }

    // Handle duplicate account errors via Section 12 Alert
    if (result.error === "EMAIL_ALREADY_EXISTS") {
      setErrorMessage(t("EMAIL_ALREADY_EXISTS_ERROR"))
    } else {
      setErrorMessage(
        result.error
          ? tErrors(getActionErrorKey(result.error))
          : t("GENERIC_ERROR")
      )
    }
  }

  // Render registration fields, error feedback, and OAuth sign-up.
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

        {/* Name Fields Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* firstName Field */}
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="firstName" className="text-xs">
                  {t("FIRST_NAME_LABEL")}
                </FieldLabel>
                <IconInput
                  {...field}
                  id="firstName"
                  type="text"
                  placeholder={t("FIRST_NAME_PLACEHOLDER")}
                  aria-invalid={fieldState.invalid}
                  autoComplete="given-name"
                  className="h-9 text-xs"
                  prefixIcon={
                    <UserIcon className="size-4 text-muted-foreground" />
                  }
                />
                {fieldState.invalid && (
                  <ActionFieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* lastName Field */}
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="lastName" className="text-xs">
                  {t("LAST_NAME_LABEL")}
                </FieldLabel>
                <IconInput
                  {...field}
                  id="lastName"
                  type="text"
                  placeholder={t("LAST_NAME_PLACEHOLDER")}
                  aria-invalid={fieldState.invalid}
                  autoComplete="family-name"
                  className="h-9 text-xs"
                />
                {fieldState.invalid && (
                  <ActionFieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Email Field */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email" className="text-xs">
                {t("EMAIL_LABEL")}
              </FieldLabel>
              <IconInput
                {...field}
                id="email"
                type="email"
                placeholder={t("EMAIL_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                className="h-9 text-xs"
                prefixIcon={
                  <MailIcon className="size-4 text-muted-foreground" />
                }
              />
              {fieldState.invalid && (
                <ActionFieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Password Field */}
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

        {errors.root && (
          <ActionFieldError errors={[{ message: errors.root.message }]} />
        )}

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

        <FieldSeparator className="my-1 text-xs">
          {t("OR_DIVIDER")}
        </FieldSeparator>

        {/* OAuth Section */}
        <Field>
          <GoogleSignInButton />
        </Field>
      </FieldGroup>
    </form>
  )
}
