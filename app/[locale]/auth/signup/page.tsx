import { SignUpForm } from "@/components/auth/signup-form"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { appRoutes } from "@/lib/config/app-routes"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Sign Up",
    description:
      "Sign up for your Marketna account to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  const user = await getCurrentUser()
  if (user) {
    redirect(appRoutes.home)
  }

  return <SignUpForm />
}
