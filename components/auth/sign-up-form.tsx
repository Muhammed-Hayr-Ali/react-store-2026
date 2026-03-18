"use client"

import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { signUpWithPassword } from "@/lib/actions/authentication/signUpWithPassword"
import { SignUpInput } from "@/lib/types/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { appRouter } from "@/lib/config/app_router"
import { Spinner } from "../ui/spinner"
import { AppLogo } from "../shared/app-logo"
import { signInWithGoogle } from "@/lib/actions/authentication/signIn-with-google"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const locale = useLocale()
  const t = useTranslations("Auth")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput & { confirm_password?: string }>()

  const onSubmit = async (data: SignUpInput) => {
    try {
      const result = await signUpWithPassword(data)

      if (!result.success) {
        toast.error(result.error)
      } else {
        setShowSuccessDialog(true)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithGoogle(locale)
      if (!result.success) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error((error as Error).message)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShowSuccessDialog(false)
    router.push(appRouter.home)
  }

  const handleTwoFactorSetup = () => {
    setShowSuccessDialog(false)
    router.push(appRouter.twoFactorSetup)
  }

  return (
    <form
      className={cn("flex flex-col gap-8", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-6">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <Link href={appRouter.home}>
            <AppLogo size="lg" />
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{t("signUp")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {t("enterDetailsSignUp")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="first_name">{t("firstName")}</FieldLabel>
            <Input
              id="first_name"
              type="text"
              autoComplete="first_name"
              placeholder={t("firstNamePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={errors.first_name ? "true" : "false"}
              {...register("first_name", {
                required: t("firstNameRequired"),
              })}
            />
            {errors.first_name && (
              <FieldDescription>{errors.first_name.message}</FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="last_name">{t("lastName")}</FieldLabel>
            <Input
              id="last_name"
              type="text"
              autoComplete="last_name"
              placeholder={t("lastNamePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={errors.last_name ? "true" : "false"}
              {...register("last_name", {
                required: t("lastNameRequired"),
              })}
            />

            {errors.last_name && (
              <FieldDescription>{errors.last_name.message}</FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: t("emailRequired"),
              pattern: {
                value:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: t("invalidEmail"),
              },
              maxLength: {
                value: 100,
                message: t("emailTooLong"),
              },
              minLength: {
                value: 8,
                message: t("emailTooShort"),
              },
            })}
          />
          {errors.email && (
            <FieldDescription>{errors.email.message}</FieldDescription>
          )}
          <FieldDescription className="text-xs">
            {t("emailInclusion")}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: t("passwordRequired"),
              maxLength: {
                value: 100,
                message: t("passwordTooLong"),
              },
              minLength: {
                value: 8,
                message: t("passwordTooShort"),
              },
            })}
          />
          {errors.password ? (
            <FieldDescription>{errors.password.message}</FieldDescription>
          ) : (
            <FieldDescription className="text-xs">
              {t("passwordRequirement")}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">
            {t("confirmPassword")}
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={errors.confirm_password ? "true" : "false"}
            {...register("confirm_password", {
              required: t("confirmPasswordRequired"),
              maxLength: {
                value: 100,
                message: t("passwordTooLong"),
              },
              minLength: {
                value: 8,
                message: t("passwordTooShort"),
              },
              validate: (value) => {
                const { password } = getValues()
                return value === password || t("passwordsDoNotMatch") // إرجاع رسالة خطأ هو الأفضل
              },
            })}
          />
          {errors.confirm_password && (
            <FieldDescription>
              {errors.confirm_password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner /> : t("submitSignUp")}
          </Button>
        </Field>
        <FieldSeparator className="my-2">{t("continueWith")}</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {t("loginWithGoogle")}
              </div>
            )}
          </Button>
        </Field>
        <FieldDescription className="text-center text-sm">
          {t("haveAccount")} <Link href={appRouter.signIn}>{t("signIn")}</Link>
        </FieldDescription>

        <p className="mt-4 px-8 text-center text-xs text-muted-foreground">
          {t("termsAndPrivacy")}{" "}
          <Link
            href={appRouter.terms}
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            {t("terms")}
          </Link>{" "}
          {t("and") || "&"}{" "}
          <Link
            href={appRouter.privacy}
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            {t("privacy")}
          </Link>
          .
        </p>
      </FieldGroup>

      {/* Success Dialog */}

      <AlertDialog open={showSuccessDialog}>
        <AlertDialogContent size="sm" className="min-w-96 space-y-4">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-16 rounded-full">
              <svg
                className="size-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </AlertDialogMedia>
            <AlertDialogTitle>{t("accountCreatedSuccess")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("twoFactorSetupDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>
              {t("continueToHome")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleTwoFactorSetup}>
              {t("enableTwoFactor")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
