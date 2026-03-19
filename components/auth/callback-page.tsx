"use client"

import { redirect, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { appRouter } from "@/lib/config/app_router"
import { useEffect, useState } from "react"
import { Lock } from "lucide-react"

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
import { createBrowserClient } from "@/lib/supabase/createBrowserClient"

export default function CallbackPage() {
  const t = useTranslations("callback")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    let isMounted = true

    const handleCallback = async () => {
      try {
        // أولاً: نحاول الحصول على الجلسة (مهم لـ OAuth callback)
        const { data: user, error: sessionError } =
          await supabase.auth.getUser()

        if (sessionError) {
          console.error("Session error:", sessionError.message)
          if (isMounted) {
            setIsLoading(false)
            setIsSuccess(false)
          }
          return
        }

        // إذا وجدت جلسة، نحصل على المستخدم
        if (user) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()

          if (userError || !user) {
            console.error("User error:", userError?.message)
            if (isMounted) {
              setIsLoading(false)
              setIsSuccess(false)
            }
            return
          }

          if (isMounted) {
            setIsLoading(false)
            setIsSuccess(true)

            // Get the MFA assurance level
            const { data: aalData, error: aalError } =
              await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

            // Check for errors
            if (aalError) {
              console.error("AalGuard Error:", aalError)
              return null
            }

            // Check if MFA is needed
            const needsMfaVerification =
              aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2"

            // Redirect to MFA verification page
            if (needsMfaVerification) {
              return redirect(appRouter.verify)
            }

            setTimeout(() => {
              if (isMounted) {
                setShowSuccessDialog(true)
              }
            }, 1000)
          }
        } else {
          // لا توجد جلسة
          if (isMounted) {
            setIsLoading(false)
            setIsSuccess(false)
          }
        }
      } catch (error) {
        console.error("Callback error:", error)
        if (isMounted) {
          setIsLoading(false)
          setIsSuccess(false)
        }
      }
    }

    handleCallback()

    // cleanup function لمنع تحديث الحالة بعد unmount
    return () => {
      isMounted = false
    }
  }, [])

  const handleClose = () => {
    setShowSuccessDialog(false)
    router.push(appRouter.home)
  }

  const handleTwoFactorSetup = () => {
    setShowSuccessDialog(false)
    router.push(appRouter.twoFactorSetup)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <h1 className="text-2xl font-bold">{t("loading")}</h1>
          <p className="mt-2 text-muted-foreground">{t("processingSignIn")}</p>
        </div>
      </div>
    )
  }

  if (!isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t("signInFailedTitle")}</h2>
          <p className="text-muted-foreground">
            {t("signInFailedDescription")}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(appRouter.signIn)}
        >
          {t("tryAgain")}
        </Button>
      </div>
    )
  }

  return (
    <>
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
    </>
  )
}
