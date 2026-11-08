/**
 * @file components/auth/login-form.tsx
 * @description Accessible, client-side login form adhering to Section 12 Alert feedback standards,
 * logical RTL layout tokens, and automated server validation binding.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { IconInput } from "@/components/ui/icon-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signInWithPassword,
  signInWithPasswordSchema,
  type SignInWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"
import { getActionErrorKey } from "@/lib/actions/error-keys"

export function LoginForm({
  lastLoginMethod,
}: {
  lastLoginMethod?: string | undefined
}) {
  // Load translations and resolve the post-login destination.
  const tErrors = useTranslations("ActionErrors")
  const t = useTranslations("LoginForm")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || appRoutes.home

  // Track password visibility and authentication errors.
  const [showPassword, setShowPassword] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Configure credential validation and initial form values.
  const form = useForm<SignInWithPasswordInput>({
    resolver: zodResolver(signInWithPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  // Authenticate the user and display validation or sign-in errors.
  async function onSubmit(data: SignInWithPasswordInput) {
    setErrorMessage(null)
    const result = await signInWithPassword(data)

    if (result.success) {
      router.refresh()
      router.replace(redirectTarget)
      return
    }

    // Intercept Server Action validation errors and bind directly to form fields
    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, msgs]) => {
        form.setError(field as keyof SignInWithPasswordInput, {
          message: msgs[0],
        })
      })
      return
    }

    // Handle authentication failures via persistent Section 12 Alert
    if (result.error === "INVALID_CREDENTIALS") {
      setErrorMessage(tErrors("INVALID_CREDENTIALS_ERROR"))
    } else if (result.error === "EMAIL_NOT_CONFIRMED") {
      setErrorMessage(tErrors("EMAIL_NOT_CONFIRMED_ERROR"))
    } else {
      setErrorMessage(
        result.error
          ? tErrors(getActionErrorKey(result.error))
          : tErrors("GENERIC_ERROR")
      )
    }
  }

    const isLastUsed = lastLoginMethod === "email"


  // Render credential fields, submit action, and OAuth alternative.
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <FieldGroup>
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
              disabled={isSubmitting || googleLoading}
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="text-xs">
                  {t("PASSWORD_LABEL")}
                </FieldLabel>
                <Link
                  href={appRoutes.auth.forgotPassword}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {t("FORGOT_PASSWORD_LINK")}
                </Link>
              </div>
              <IconInput
                {...field}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("PASSWORD_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
                className="h-9 text-xs"
              disabled={isSubmitting || googleLoading}
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
          <div className="relative w-full">
            {/* Logical RTL Placement: -inset-e-2.5 */}
                 {isLastUsed && (
                   <div className="pointer-events-none absolute -inset-e-2.5 -top-2.5 z-10">
                     <Badge
                       variant="secondary"
                       className="h-3.5 bg-green-50 px-1 text-[8px] font-normal tracking-wide text-green-700 uppercase dark:bg-green-950 dark:text-green-300"
                     >
                       {t("LAST_USED_BADGE")}
                     </Badge>
                   </div>
                 )}
            <Button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className="h-9 w-full text-xs font-medium uppercase shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="me-2 size-3.5" />
                  <span>{t("SIGN_IN_SUBMITTING")}</span>
                </>
              ) : (
                t("SIGN_IN_BUTTON")
              )}
            </Button>
          </div>
        </Field>

        <FieldSeparator className="my-2 *:data-[slot=field-separator-content]:bg-card">
          {t("OR_DIVIDER")}
        </FieldSeparator>

        {/* OAuth Section */}
        <Field>
          <GoogleSignInButton lastLoginMethod={lastLoginMethod} disabled={isSubmitting} onLoading={setGoogleLoading} />
        </Field>

        <Field>
          <FieldDescription className="text-center">
            {t("DONT_HAVE_ACCOUNT")}{" "}
            <Link href={appRoutes.auth.signup}>{t("Sign up")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
