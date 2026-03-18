"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/shared/app-logo"
import { appRouter } from "@/lib/config/app_router"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Suspense } from "react"

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

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations("Auth")

  // قراءة الخطأ أو النجاح من URL مباشرة دون useEffect
  const urlError = searchParams.get("error")
  const errorCode = searchParams.get("code")
  const success = searchParams.get("success")

  const isSuccess = success === "true"
  const error = urlError ? urlError.split("#")[0] : ""

  // ترجمة رسائل الخطأ الشائعة
  const getErrorMessage = () => {
    switch (error) {
      case "access_denied":
        return t("accessDenied") || "تم رفض الوصول"
      case "token_exchange_failed":
        return t("tokenExchangeFailed") || "فشل تبادل الرمز"
      case "unexpected_error":
        return t("unexpectedError") || "حدث خطأ غير متوقع"
      case "no_code":
        return t("noCode") || "لم يتم استلام رمز المصادقة"
      default:
        return t("authError") || "حدث خطأ في المصادقة"
    }
  }

  const handleClose = () => {
    router.push(appRouter.home)
  }

  const handleTwoFactorSetup = () => {
    router.push(appRouter.twoFactorSetup)
  }

  // حالة النجاح - عرض الدايلوج
  if (isSuccess) {
    return (
      <>
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-4 py-8 text-center">
          <AppLogo size="lg" />

          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h1 className="pt-4 text-2xl font-bold tracking-tight">
                {t("accountCreatedSuccess") || "تم إنشاء الحساب بنجاح"}
              </h1>

              <p className="text-muted-foreground">
                {t("twoFactorSetupDesc") ||
                  "هل تريد تفعيل المصادقة الثنائية الآن؟"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleTwoFactorSetup}>
                {t("enableTwoFactor") || "تفعيل المصادقة الثنائية"}
              </Button>

              <Button variant="outline" onClick={handleClose}>
                {t("continueToHome") || "المتابعة إلى الرئيسية"}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Dialog */}
        <AlertDialog open>
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
      </>
    )
  }

  // حالة الخطأ
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-4 py-8 text-center">
      <AppLogo size="lg" />

      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="pt-4 text-2xl font-bold tracking-tight">
            {t("authErrorTitle") || "خطأ في المصادقة"}
          </h1>

          <p className="text-muted-foreground">{getErrorMessage()}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => (window.location.href = appRouter.signIn)}>
            {t("backToSignIn") || "العودة إلى تسجيل الدخول"}
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = appRouter.home)}
          >
            {t("goToHome") || "العودة إلى الصفحة الرئيسية"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <code>{error}</code>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
