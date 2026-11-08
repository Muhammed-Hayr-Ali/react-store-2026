/**
 * @file components/auth/auth-callback-view.tsx
 * @description Client-side view orchestrating OAuth code exchange with consistent UI states and delayed success transitions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { handleAuthCallback } from "@/lib/actions/authentication"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { APP_ROUTES } from "@/lib/config/app-routes"

export type ResponserStatus = "loading" | "success" | "error"

interface AuthCallbackViewProps {
  code?: string
  error?: string
}

function AuthCallbackView({ code }: AuthCallbackViewProps) {
  const router = useRouter()
  const started = React.useRef(false)
  const [responserStatus, setResponserStatus] =
    React.useState<ResponserStatus>("loading")
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>()

  React.useEffect(() => {
    if (!code || started.current) return
    started.current = true

    handleAuthCallback({ code })
      .then((result) => {
        if (!result.success) {
          setErrorMessage(result.error)
          setResponserStatus("error")
          return
        }

        setResponserStatus("success")
        toast.success("تم تسجيل الدخول بنجاح")

        setTimeout(() => {
          router.replace(APP_ROUTES.HOME)
          router.refresh()
        }, 1500)
      })
      .catch(() => {
        setErrorMessage("EXCHANGE_FAILED")
        setResponserStatus("error")
      })
  }, [code, router])

  if (responserStatus === "error") {
    return <AuthCallbackError error={errorMessage} />
  }

  if (responserStatus === "success") {
    return <AuthCallbackSuccess />
  }

  return <AuthCallbackLoading />
}

function AuthCallbackSuccess() {
  const t = useTranslations("AuthCallback")

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2Icon className="size-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t("SUCCESS_TITLE")}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("SUCCESS_SUBTITLE")}
      </p>
    </div>
  )
}

function AuthCallbackLoading() {
  const t = useTranslations("AuthCallback")

  return (
    <div className="flex w-full flex-col items-center justify-center py-6 text-center">
      <Spinner className="size-6 text-primary" />
      <h1 className="mt-4 text-base font-semibold text-foreground">
        {t("LOADING_TITLE")}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("LOADING_SUBTITLE")}
      </p>
    </div>
  )
}

function AuthCallbackError({ error }: { error?: string }) {
  const tErrors = useTranslations("ActionErrors")
  const t = useTranslations("AuthCallback")

  const errorKey = error ? getActionErrorKey(error) : "EXCHANGE_FAILED"

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircleIcon className="size-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t("FAILED_TITLE")}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {tErrors(errorKey)}
      </p>
      <Button
        variant="outline"
        className="mt-6 h-9 w-full text-xs font-medium shadow-xs"
        asChild
      >
        <Link href={APP_ROUTES.AUTH.LOGIN}>{t("RETURN_TO_LOGIN")}</Link>
      </Button>
    </div>
  )
}

export {
  AuthCallbackView,
  AuthCallbackLoading,
  AuthCallbackSuccess,
  AuthCallbackError,
}
