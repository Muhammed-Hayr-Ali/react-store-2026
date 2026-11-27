/**
 * @file components/auth/auth-callback-view.tsx
 * @description Client-side view orchestrating OAuth code exchange with consistent UI states and delayed success transitions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  LoadingStatusAnimation,
  type ProcessStatus,
} from "@/components/shared/loading_states_animation"
import { handleAuthCallback } from "@/lib/actions/authentication"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { APP_ROUTES } from "@/lib/config/app-routes"

export type ResponserStatus = ProcessStatus

const SUCCESS_REDIRECT_DELAY_MS = 1500

interface AuthCallbackViewProps {
  code: string | undefined
  error: string | undefined
  errorDescription: string | undefined
}

function AuthCallbackView({
  code,
  error,
  errorDescription,
}: AuthCallbackViewProps) {
  const router = useRouter()
  const started = React.useRef(false)
  const redirectTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [responserStatus, setResponserStatus] =
    React.useState<ResponserStatus>(() =>
      error || !code ? "error" : "loading"
    )
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    () => error || (!code ? "MISSING_AUTH_CODE" : undefined)
  )

  React.useEffect(() => {
    if (error || !code || started.current) return
    started.current = true

    handleAuthCallback({ code })
      .then((result) => {
        if (!result.success) {
          console.error(
            "OAuth code exchange returned an error:",
            result.error,
            result.details
          )
          setErrorMessage(result.details?.auth?.[0] ?? result.error)
          setResponserStatus("error")
          return
        }

        setResponserStatus("success")

        redirectTimer.current = setTimeout(() => {
          router.refresh()
          router.replace(APP_ROUTES.HOME)
        }, SUCCESS_REDIRECT_DELAY_MS)
      })
      .catch((error: unknown) => {
        console.error("OAuth callback failed:", error)
        setErrorMessage(
          error instanceof Error ? error.message : "EXCHANGE_FAILED"
        )
        setResponserStatus("error")
      })
  }, [code, error, router])

  // تنظيف مؤقت إعادة التوجيه عند مغادرة الصفحة
  React.useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [])

  const hasError = responserStatus === "error" || Boolean(error)
  const status: ProcessStatus = hasError ? "error" : responserStatus

  // نفس المكوّن (AuthCallbackPanel) يبقى مركّبًا في كل الحالات،
  // فيستمر نفس الـ Rive instance وتظهر الانتقالات (loading → success/error) بسلاسة.
  return (
    <AuthCallbackPanel
      status={status}
      error={error ?? errorMessage}
      errorDescription={errorDescription}
    />
  )
}

interface AuthCallbackPanelProps {
  status: ProcessStatus
  error?: string
  errorDescription?: string
}

function AuthCallbackPanel({
  status,
  error,
  errorDescription,
}: AuthCallbackPanelProps) {
  const tErrors = useTranslations("ActionErrors")
  const t = useTranslations("AuthCallback")

  const errorKey = error ? getActionErrorKey(error) : "EXCHANGE_FAILED"

  return (
    <div
      className="flex min-h-48 w-full flex-col items-center justify-center py-6 text-center"
      aria-live="polite"
    >
      <LoadingStatusAnimation status={status} className="mb-2 size-28" />

      {status === "loading" && (
        <>
          <h1 className="text-base font-semibold text-foreground">
            {t("LOADING_TITLE")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("LOADING_SUBTITLE")}
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("SUCCESS_TITLE")}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("SUCCESS_SUBTITLE")}
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("FAILED_TITLE")}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {errorDescription ||
              (error === "access_denied"
                ? tErrors("ACCESS_DENIED")
                : tErrors(errorKey))}
          </p>
          <Button
            variant="outline"
            className="mt-6 h-9 w-full text-xs font-medium shadow-xs"
            asChild
          >
            <Link href={APP_ROUTES.AUTH.LOGIN}>{t("RETURN_TO_LOGIN")}</Link>
          </Button>
        </>
      )}
    </div>
  )
}

// أغلفة رفيعة للحفاظ على الـ exports القديمة (مثل استخدام Loading كـ Suspense fallback)
function AuthCallbackLoading() {
  return <AuthCallbackPanel status="loading" />
}

function AuthCallbackSuccess() {
  return <AuthCallbackPanel status="success" />
}

function AuthCallbackError({ error }: { error?: string }) {
  return <AuthCallbackPanel status="error" error={error} />
}

export {
  AuthCallbackView,
  AuthCallbackLoading,
  AuthCallbackSuccess,
  AuthCallbackError,
}