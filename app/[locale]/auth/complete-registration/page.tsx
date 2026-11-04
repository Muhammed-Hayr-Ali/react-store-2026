/**
 * @file app/[locale]/(auth)/signup/page.tsx
 * @description Server Component page for customer sign-up with active session guard
 * and localized metadata generation.
 */

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { CompleteProfilePage } from "@/components/authentication/complete_your_profile"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"

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
    // description: "Complete your registration and start enjoying our services.",
    description: t("META_DESCRIPTION"),
  })
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  await params

  // get Phone number from query params if available
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  )
  const lastSignupPhone = searchParams.get("phone") || null
  const redirectTarget = searchParams.get("redirect") || appRoutes.home


  // Zero-Trust Session Check: Redirect active authenticated users
  const userResult = await getCurrentUser()
  if (userResult.success && userResult.data) {
    redirect(appRoutes.home)
  }




  return <CompleteProfilePage phone={lastSignupPhone} />
}
