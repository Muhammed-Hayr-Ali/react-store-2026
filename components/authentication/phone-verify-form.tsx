/**
 * @file components/authentication/phone-verify-form.tsx
 * @description Accessible, client-side phone OTP verification form adhering to Section 12 Alert feedback standards,
 * logical layout tokens, and automated server validation binding.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { AlertCircleIcon, XIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActionFieldError } from "@/components/shared/action-field-error"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthHeader } from "./auth-header"
import {
  CustomInputOTP,
  CustomInputOTPGroup,
  CustomInputOTPSlot,
} from "@/components/ui/custom-input-otp"

import {
  verifyPhoneOtp,
  sendPhoneOtp,
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from "@/lib/actions/phone-otps"
import { appRoutes } from "@/lib/config/app-routes"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface PhoneVerifyFormProps {
  initialPhoneNumber: string | null
  redirectTarget: string
}

export function PhoneVerifyForm({
  initialPhoneNumber,
  redirectTarget,
}: PhoneVerifyFormProps) {
  const t = useTranslations("PhoneVerifyForm")
  const locale = useLocale()
  const router = useRouter()

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isResending, setIsResending] = React.useState(false)

  // إذا لم يكن رقم الهاتف موجوداً، يمكن توجيه المستخدم لصفحة التسجيل
  React.useEffect(() => {
    if (!initialPhoneNumber) {
      router.replace(appRoutes.auth.signup)
    }
  }, [initialPhoneNumber, router])

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || "",
      code: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  async function onSubmit(data: VerifyOtpFormValues) {
    setErrorMessage(null)
    const result = await verifyPhoneOtp(data)

    if (result.success) {
      router.refresh()
      // go to completed registration page or redirect target wit phone number as query parameter
      router.replace(`/${locale}/auth/complete-registration?phone=${encodeURIComponent(data.phoneNumber)}&redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    if (result.error === "VALIDATION_ERROR" && result.details) {
      Object.entries(result.details).forEach(([field, msgs]) => {
        form.setError(field as keyof VerifyOtpFormValues, {
          message: msgs[0],
        })
      })
      return
    }

    setErrorMessage(
      result.error
        ? t(`ERRORS.${getActionErrorKey(result.error)}`, {
            defaultValue: t("GENERIC_ERROR"),
          })
        : t("GENERIC_ERROR")
    )
  }

  async function handleResendOtp() {
    if (!initialPhoneNumber || isResending) return
    setErrorMessage(null)
    setIsResending(true)

    const result = await sendPhoneOtp(
      { phoneNumber: initialPhoneNumber },
      locale
    )
    setIsResending(false)

    if (!result.success) {
      setErrorMessage(
        result.error
          ? t(`ERRORS.${getActionErrorKey(result.error)}`, {
              defaultValue: t("GENERIC_ERROR"),
            })
          : t("GENERIC_ERROR")
      )
    }
  }

  if (!initialPhoneNumber) return null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <FieldGroup className="space-y-4">
        <AuthHeader
          title={t("WELCOME_TITLE")}
          description={t("VERIFY_SUBTITLE", { phone: initialPhoneNumber })}
          linkText={t("BACK_BUTTON")}
          linkHref={appRoutes.auth.signup}
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
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="code" className="text-xs">
                {t("CODE_LABEL")}
              </FieldLabel>
              <div className="flex w-full justify-center">
                <CustomInputOTP
                  maxLength={6}
                  {...field}
                  id="code"
                  placeholder={t("CODE_PLACEHOLDER")}
                  aria-invalid={fieldState.invalid}
                  dir="ltr"
                >
                  <CustomInputOTPGroup>
                    <CustomInputOTPSlot index={0} />
                    <CustomInputOTPSlot index={1} />
                    <CustomInputOTPSlot index={2} />
                    <CustomInputOTPSlot index={3} />
                    <CustomInputOTPSlot index={4} />
                    <CustomInputOTPSlot index={5} />
                  </CustomInputOTPGroup>
                </CustomInputOTP>
              </div>

              {fieldState.invalid && (
                <ActionFieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {errors.root && errors.root.message && (
          <ActionFieldError errors={[{ message: t(errors.root.message) }]} />
        )}

        <Field className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full text-xs font-medium uppercase shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Spinner className="me-2 size-3.5" />
                <span>{t("VERIFYING_BUTTON")}</span>
              </>
            ) : (
              t("VERIFY_BUTTON")
            )}
          </Button>
        </Field>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {t("DID_NOT_RECEIVE")}
          </span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="inline-flex items-center text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isResending && (
              <RotateCwIcon className="me-1.5 size-3 animate-spin" />
            )}
            {t("RESEND_BUTTON")}
          </button>
        </div>
      </FieldGroup>
    </form>
  )
}
