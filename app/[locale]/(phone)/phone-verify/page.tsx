/**
 * @file app/[locale]/(auth)/phone-verify/page.tsx
 * @description Server Component page for phone OTP verification with active session protection
 * and unified metadata resolution.
 */

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { PhoneVerifyForm } from "@/components/phone_otp/phone-verify-form"
 
interface PhoneVerifyPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    phone?: string
    redirect?: string
  }>
}

export async function generateMetadata({ params }: PhoneVerifyPageProps) {
  await params
  const t = await getTranslations("PhoneVerifyPage")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function PhoneVerifyPage({
  params,
  searchParams,
}: PhoneVerifyPageProps) {
  await params
  const resolvedSearchParams = await searchParams

  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }

  const phoneNumber = resolvedSearchParams.phone ?? null
  const redirectTarget = resolvedSearchParams.redirect ?? appRoutes.home

  return (
    <PhoneVerifyForm
      initialPhoneNumber={phoneNumber}
      redirectTarget={redirectTarget}
    />
  )
}
