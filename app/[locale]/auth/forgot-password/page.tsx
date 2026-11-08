/**
 * @file app/[locale]/(auth)/forgot-password/page.tsx
 * @description Server Component page for password reset requests with session guarding.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ForgotPasswordForm } from "@/components/authentication/forgot-password-form"
import { APP_CONFIG } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ForgotPasswordPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: ForgotPasswordPageProps) {
  await params
  const t = await getTranslations("ForgotPassword")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPassword")

  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(APP_ROUTES.HOME)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("TITLE")}</CardTitle>
        <CardDescription>{t("SUBTITLE")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
