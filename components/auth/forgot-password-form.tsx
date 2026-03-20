"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { requestPasswordReset } from "@/lib/actions/authentication/requestPasswordReset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { MailIcon, ArrowLeftIcon } from "@/components/shared/icons"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { appRouter } from "@/lib/app-routes"

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    startTransition(async () => {
      const result = await requestPasswordReset(data.email)

      if (result.success) {
        setIsSubmitted(true)
        toast.success(t("emailSent"))
      } else {
        toast.error(result.error || t("emailSent"))
      }
    })
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <MailIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("checkYourEmail")}</h2>
          <p className="text-muted-foreground">{t("resetInstructions")}</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(appRouter.signIn)}
          >
            <ArrowLeftIcon className="ml-2 h-4 w-4" />
            {t("backToSignIn")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            disabled={isPending}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email", {
              required: t("emailRequired"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("invalidEmail"),
              },
            })}
          />
          {errors.email && (
            <FieldDescription className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="ml-2" />
              {t("sending")}
            </>
          ) : (
            t("sendResetLink")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-muted-foreground"
          onClick={() => router.push(appRouter.signIn)}
        >
          <ArrowLeftIcon className="ml-2 h-4 w-4" />
          {t("backToSignIn")}
        </Button>
      </div>
    </div>
  )
}
