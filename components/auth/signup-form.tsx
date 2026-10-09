/**
 * @file components/auth/signup-form.tsx
 * @description Customer registration form with client validation,
 * inline field bindings, and Section 12 destructive alert management.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CustomInput } from "@/components/ui/custom-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signUpWithPassword,
  signUpWithPasswordSchema,
  type SignUpWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

export function SignUpForm() {
  const t = useTranslations("SignUpForm")
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const form = useForm<SignUpWithPasswordInput>({
    resolver: zodResolver(signUpWithPasswordSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: SignUpWithPasswordInput) {
    setErrorMessage(null)
    const result = await signUpWithPassword(data)

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
      setErrorMessage(result.error || t("GENERIC_ERROR"))
    }
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

        {/* Name Field */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name" className="text-xs">
                {t("NAME_LABEL")}
              </FieldLabel>
              <CustomInput
                {...field}
                id="name"
                type="text"
                placeholder={t("NAME_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="name"
                className="h-9 text-xs"
                prefixIcon={<UserIcon className="size-4 text-muted-foreground" />}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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

        {/* Password Field */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password" className="text-xs">
                {t("PASSWORD_LABEL")}
              </FieldLabel>
              <CustomInput
                {...field}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("PASSWORD_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                className="h-9 text-xs"
                prefixIcon={<LockIcon className="size-4 text-muted-foreground" />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {errors.root && (
          <FieldError errors={[{ message: errors.root.message }]} />
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
                <Spinner className="size-3.5 me-2" />
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