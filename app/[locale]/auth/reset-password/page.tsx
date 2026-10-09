/**
 * @file app/[locale]/(auth)/reset-password/page.tsx
 * @description Server Component page ensuring valid query tokens before form delegation.
 */

import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { AlertTriangleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"

interface ResetPasswordPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    token?: string
  }>
}

export async function generateMetadata({ params }: ResetPasswordPageProps) {
  await params
  const t = await getTranslations("ResetPasswordPage")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  await params
  const { token } = await searchParams
  const t = await getTranslations("ResetPasswordPage")

  // Fallback view when token query param is missing
  if (!token) {
    return (
      <div className="flex w-full flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {t("MISSING_TOKEN_TITLE")}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("MISSING_TOKEN_DESCRIPTION")}
        </p>
        <Button
          variant="outline"
          className="mt-6 h-9 w-full text-xs font-medium shadow-xs"
          asChild
        >
          <Link href={appRoutes.auth.forgotPassword}>
            {t("REQUEST_NEW_LINK_BUTTON")}
          </Link>
        </Button>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}