import { redirect } from "next/navigation"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Forgot password",
    description: "Forgot password page for Marketna",
  })
}

export default async function Page() {
  const user = await getCurrentUser()
  if (user) {
    redirect(appRoutes.home)
  }

  return <ForgotPasswordForm />
}
