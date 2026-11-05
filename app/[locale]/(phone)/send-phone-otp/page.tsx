/**
 * @file app/[locale]/(auth)/phone-verify/page.tsx
 * @description Server Component page for phone OTP verification with active session protection
 * and unified metadata resolution.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { SendPhoneOtp } from "@/components/phone_otp/send_phone_otp"

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
  const t = await getTranslations("SendPhoneOtp")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PhoneVerifyPageProps) {
  await params

  return <SendPhoneOtp />
}
