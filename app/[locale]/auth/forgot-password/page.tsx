/**
 * @file app/[locale]/(auth)/forgot-password/page.tsx
 * @description Server Component page for password reset requests with session guarding.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { getCurrentUser } from "@/lib/actions/authentication"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"

interface ForgotPasswordPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: ForgotPasswordPageProps) {
  await params
  const t = await getTranslations("ForgotPasswordPage")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  await params

  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }

  return <ForgotPasswordForm />
}