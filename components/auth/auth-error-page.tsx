"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/shared/app-logo"
import { appRouter } from "@/lib/config/app_router"
import { AlertCircle } from "lucide-react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("Auth")
  const [error, setError] = useState("")

  useEffect(() => {
    // قراءة الخطأ من URL
    const urlError = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    
    if (urlError) {
      // تنظيف رسالة الخطأ من hash fragments
      const cleanError = urlError.split("#")[0]
      setError(cleanError)
    }
  }, [searchParams])

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
          
          <p className="text-muted-foreground">
            {getErrorMessage()}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => window.location.href = appRouter.signIn}>
            {t("backToSignIn") || "العودة إلى تسجيل الدخول"}
          </Button>
          
          <Button variant="outline" onClick={() => window.location.href = appRouter.home}>
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
