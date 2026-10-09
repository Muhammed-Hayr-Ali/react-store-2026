/**
 * @file app/[locale]/(auth)/signup/page.tsx
 * @description Server Component page for customer sign-up with active session guard
 * and localized metadata generation.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { SignUpForm } from "@/components/auth/signup-form"
import { getCurrentUser } from "@/lib/actions/authentication"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"

interface SignUpPageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: SignUpPageProps) {
  await params
  const t = await getTranslations("SignUpPage")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  await params

  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }

  return <SignUpForm />
}