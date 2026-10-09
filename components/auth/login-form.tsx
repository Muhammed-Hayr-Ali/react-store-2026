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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { CustomInput } from "@/components/ui/custom-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"
import { GoogleSignInButton } from "./google-sign-in-button"

import {
  signInWithPassword,
  signInWithPasswordSchema,
  type SignInWithPasswordInput,
} from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

interface LoginFormProps {
  lastLoginMethod?: string | null
}

export function LoginForm({ lastLoginMethod }: LoginFormProps) {
  const t = useTranslations("LoginForm")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get("redirect") || appRoutes.home

  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

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
      setErrorMessage(t("INVALID_CREDENTIALS_ERROR"))
    } else if (result.error === "EMAIL_NOT_CONFIRMED") {
      setErrorMessage(t("EMAIL_NOT_CONFIRMED_ERROR"))
    } else {
      setErrorMessage(result.error || t("GENERIC_ERROR"))
    }
  }

  const isEmailLastUsed = lastLoginMethod === "email"

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <FieldGroup className="space-y-4">
        <AuthHeader
          title={t("WELCOME_TITLE")}
          description={t("SIGN_IN_SUBTITLE")}
          linkText={t("SIGN_UP_LINK")}
          linkHref={appRoutes.auth.signup}
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
              <CustomInput
                {...field}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("PASSWORD_PLACEHOLDER")}
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
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
          <div className="relative w-full">
            {isEmailLastUsed && (
              <div className="pointer-events-none absolute -top-2.5 -inset-e-2.5 z-10">
                <Badge
                  variant="secondary"
                  className="h-4 border border-border/80 bg-secondary px-1.5 text-[9px] font-medium tracking-wide text-foreground shadow-xs"
                >
                  {t("LAST_USED_BADGE")}
                </Badge>
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 w-full text-xs font-medium uppercase shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-3.5 me-2" />
                  <span>{t("SIGN_IN_SUBMITTING")}</span>
                </>
              ) : (
                t("SIGN_IN_BUTTON")
              )}
            </Button>
          </div>
        </Field>

        <FieldSeparator className="my-1 text-xs">
          {t("OR_DIVIDER")}
        </FieldSeparator>

        {/* OAuth Section */}
        <Field>
          <GoogleSignInButton lastLoginMethod={lastLoginMethod} />
        </Field>
      </FieldGroup>
    </form>
  )
}