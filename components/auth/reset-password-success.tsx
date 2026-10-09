/**
 * @file components/auth/reset-password-success.tsx
 * @description Accessible confirmation card indicating successful delivery of the password reset email,
 * styled strictly using system design tokens and RTL logical properties.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  CircleCheckIcon,
  MailIcon,
  AlertCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { appRoutes } from "@/lib/config/app-routes"

interface ResetPasswordSuccessProps {
  email: string
  onRetry: () => void
}

export function ResetPasswordSuccess({
  email,
  onRetry,
}: ResetPasswordSuccessProps) {
  const t = useTranslations("ResetPasswordSuccess")

  return (
    <div className="flex w-full flex-col text-start">
      {/* Success Badge Icon */}
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CircleCheckIcon className="size-7" />
      </div>

      {/* Main Title & Description */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("CHECK_EMAIL_TITLE")}
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t("CHECK_EMAIL_DESCRIPTION")}
        </p>
      </div>

      {/* Verified Email Container */}
      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3.5 py-2.5">
        <MailIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="font-mono text-xs font-semibold text-foreground">
          {email}
        </span>
      </div>

      {/* Information Notes */}
      <div className="mb-6 space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3.5">
        <div className="flex items-start gap-2.5">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {t("DIDNT_RECEIVE_TITLE")}
            </span>{" "}
            {t("DIDNT_RECEIVE_PREFIX")}{" "}
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t("TRY_ANOTHER_EMAIL")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
          <span>{t("TOKEN_EXPIRATION_NOTICE")}</span>
        </div>
      </div>

      {/* Back to Login Action */}
      <Button
        variant="outline"
        className="h-9 w-full text-xs font-medium shadow-xs"
        asChild
      >
        <Link href={appRoutes.auth.login}>
          <ArrowLeftIcon className="size-3.5 me-2 rtl:rotate-180" />
          <span>{t("BACK_TO_LOGIN_BUTTON")}</span>
        </Link>
      </Button>
    </div>
  )
}