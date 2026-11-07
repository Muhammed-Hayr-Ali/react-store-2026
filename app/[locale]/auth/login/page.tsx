/**
 * @file app/[locale]/(auth)/login/page.tsx
 * @description Server Component page for customer sign-in with active session protection
 * and unified metadata resolution.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

import { LoginForm } from "@/components/authentication/login-form"
import { appConfig } from "@/lib/config/app_config"
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

interface LoginPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: LoginPageProps) {
  await params
  const t = await getTranslations("LoginForm")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function LoginPage() {
  const cookieStore = await cookies()

  const t = await getTranslations("LoginForm")

  const userResult = await getCurrentUser()

  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }

  const lastLoginMethod = cookieStore.get("lastLoginMethod")

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("TITLE")}</CardTitle>
        <CardDescription>{t("SUBTITLE")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
