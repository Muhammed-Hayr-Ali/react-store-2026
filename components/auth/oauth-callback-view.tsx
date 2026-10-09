/**
 * @file components/auth/oauth-callback-view.tsx
 * @description Client-side view orchestrating OAuth code exchange and rendering accessible progress feedback.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { handleCallback } from "@/lib/actions/authentication"
import { appRoutes } from "@/lib/config/app-routes"

interface OAuthCallbackViewProps {
  code?: string
  error?: string
  errorDescription?: string
}

export function OAuthCallbackView({
  code,
  error,
  errorDescription,
}: OAuthCallbackViewProps) {
  const t = useTranslations("OAuthCallback")
  const router = useRouter()
  const hasProcessed = React.useRef(false)

  React.useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    if (code) {
      const processExchange = async () => {
        try {
          const result = await handleCallback({ code })
          if (result.success) {
            toast.success(t("SIGN_IN_SUCCESS_TOAST"))
            router.refresh()
            router.replace(appRoutes.home)
          } else {
            toast.error(result.error || t("EXCHANGE_FAILED"))
            router.replace(appRoutes.auth.login)
          }
        } catch (err) {
          console.error("OAuth callback error:", err)
          toast.error(t("EXCHANGE_FAILED"))
          router.replace(appRoutes.auth.login)
        }
      }

      processExchange()
    }
  }, [code, router, t])

  // Error view when OAuth provider returns an error parameter
  if (error) {
    return (
      <div className="flex w-full flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircleIcon className="size-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("FAILED_TITLE")}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {errorDescription || t("DEFAULT_ERROR_DESCRIPTION")}
        </p>
        <Button
          variant="outline"
          className="mt-6 h-9 w-full text-xs font-medium shadow-xs"
          onClick={() => router.replace(appRoutes.auth.login)}
        >
          {t("RETURN_TO_LOGIN")}
        </Button>
      </div>
    )
  }

  // Active processing loader
  return (
    <div className="flex w-full flex-col items-center justify-center py-6 text-center">
      <Spinner className="size-7 text-primary" />
      <h1 className="mt-4 text-base font-semibold text-foreground">
        {t("PROCESSING_TITLE")}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("PROCESSING_DESCRIPTION")}
      </p>
    </div>
  )
}