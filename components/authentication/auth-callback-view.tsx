"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { XCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { handleAuthCallback } from "@/lib/actions/authentication"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appRoutes } from "@/lib/config/app-routes"

function AuthCallbackView({ code }: { code: string }) {
  const tErrors = useTranslations("ActionErrors")
  const t = useTranslations("AuthCallback")
  const router = useRouter()
  const started = React.useRef(false)

  React.useEffect(() => {
    if (started.current) return // يمنع التنفيذ المزدوج في Strict Mode
    started.current = true

    const fail = (key: string) => {
      toast.error(tErrors(key))
      router.replace(APP_ROUTES.AUTH.LOGIN)
    }

    handleAuthCallback({ code })
      .then((result) => {
        if (!result.success) {
          return fail(
            result.error ? getActionErrorKey(result.error) : "EXCHANGE_FAILED"
          )
        }
        toast.success(t("SIGN_IN_SUCCESS_TOAST"))
        router.replace(APP_ROUTES.HOME)
        router.refresh()
      })
      .catch(() => fail("EXCHANGE_FAILED"))
  }, [code, router, t, tErrors])

  return (
    <div className="flex w-full flex-col items-center justify-center py-6 text-center">
      <Spinner className="text-primary" />
      <h1 className="mt-4 text-base font-semibold text-foreground">
        {t("TITLE")}
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">{t("SUBTITLE")}</p>
    </div>
  )
}

function AuthCallbackError({ error }: { error?: string }) {
  const tErrors = useTranslations("ActionErrors")
  const t = useTranslations("AuthCallback")

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircleIcon className="size-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t("FAILED_TITLE")}
      </h1>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {tErrors(error ? getActionErrorKey(error) : "EXCHANGE_FAILED")}
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

export { AuthCallbackView, AuthCallbackError }
