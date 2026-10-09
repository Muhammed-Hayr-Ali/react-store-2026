/**
 * @file components/auth/google-sign-in-button.tsx
 * @description Accessible Google OAuth action button with non-blocking transition,
 * localized states, and logical RTL badge positioning.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { signInWithGoogle } from "@/lib/actions/authentication"

interface GoogleSignInButtonProps {
  lastLoginMethod?: string | null
}

export function GoogleSignInButton({
  lastLoginMethod,
}: GoogleSignInButtonProps) {
  const t = useTranslations("GoogleSignInButton")
  const [isPending, startTransition] = React.useTransition()

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        const result = await signInWithGoogle()

        if (result.success && result.data?.url) {
          window.location.href = result.data.url
          return
        }

        const errorMessage =
          !result.success && result.error
            ? result.error
            : t("SIGN_IN_FAILED_FALLBACK")

        toast.error(errorMessage)
      } catch (err) {
        console.error("Google OAuth dispatch error:", err)
        toast.error(t("UNEXPECTED_ERROR"))
      }
    })
  }

  const isLastUsed = lastLoginMethod === "google"

  return (
    <div className="relative w-full">
      {/* Logical RTL Placement: -inset-e-2.5 */}
      {isLastUsed && (
        <div className="pointer-events-none absolute -top-2.5 -inset-e-2.5 z-10">
          <Badge
            variant="secondary"
            className="h-4 border border-border/80 bg-secondary px-1.5 text-[9px] font-medium tracking-wide text-foreground shadow-xs"
          >
            {t("LAST_USED_BADGE")}
          </Badge>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="relative flex h-9 w-full items-center justify-center gap-2 text-xs font-medium shadow-xs hover:bg-muted/50"
      >
        {isPending ? (
          <>
            <Spinner className="size-3.5" />
            <span>{t("CONNECTING")}</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span>{t("CONTINUE_WITH_GOOGLE")}</span>
          </>
        )}
      </Button>
    </div>
  )
}