/**
 * @file app/[locale]/(auth)/signup/page.tsx
 * @description Server Component page for customer phone sign-up with active session protection
 * and unified metadata resolution.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { APP_CONFIG } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { SignUpForm } from "@/components/authentication/sign-up-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SignUpPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: SignUpPageProps) {
  await params
  const t = await getTranslations("SignUp")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function SignUpPage() {
  const t = await getTranslations("SignUp")

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
        <SignUpForm />
      </CardContent>
    </Card>
  )
}
