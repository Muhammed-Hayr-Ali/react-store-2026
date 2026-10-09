/**
 * @file app/[locale]/(auth)/login/page.tsx
 * @description Server Component page for customer sign-in with active session protection
 * and unified metadata resolution.
 */

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUser } from "@/lib/actions/authentication"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"

interface LoginPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: LoginPageProps) {
  await params
  const t = await getTranslations("LoginPage")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function LoginPage({ params }: LoginPageProps) {
  await params

  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }

  const cookieStore = await cookies()
  const lastLoginMethod = cookieStore.get("login_method")?.value ?? null

  return <LoginForm lastLoginMethod={lastLoginMethod} />
}