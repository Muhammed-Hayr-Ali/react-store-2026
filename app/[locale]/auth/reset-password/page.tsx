import { redirect } from "next/navigation"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: "Marketna",
    title: "Reset Password",
    description:
      "Reset your Marketna password to access your account and continue shopping.",
  })
}


export default async function Page() {

  const user = await getCurrentUser()
  if (user) {
    redirect(appRoutes.home)
  }

  return <ResetPasswordForm />
}
