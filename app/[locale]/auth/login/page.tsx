/**
 * @file app/[locale]/(auth)/login/page.tsx
 * @description Server Component page for customer sign-in with active session protection
 * and unified metadata resolution.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

import { LoginForm } from "@/components/authentication/login-form"
import { APP_CONFIG, COOKIES_KEYS } from "@/lib/config/app_config"
import { APP_ROUTES } from "@/lib/config/app-routes"
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
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function LoginPage() {
  const cookieStore = await cookies()

  const t = await getTranslations("LoginForm")

  const userResult = await getCurrentUser()

  if (userResult.success && userResult.data) {
    redirect(APP_ROUTES.HOME)
  }

  const loginMethod = cookieStore.get(COOKIES_KEYS.LOGIN_METHOD)?.value

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("TITLE")}</CardTitle>
        <CardDescription>{t("SUBTITLE")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm lastLoginMethod={loginMethod} />
      </CardContent>
    </Card>
  )
}
