import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import { LoginForm } from "@/components/auth/login-form"
import { appConfig } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Login",
    description:
      "Login to your Marketna account to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {

  const user = await getCurrentUser()
  if (user) {
    redirect(appRoutes.home)
  }


  const cookieStore = await cookies()
  const loginMethod = cookieStore.get("login_method")

  return <LoginForm lastLoginMethod={loginMethod?.value} />
}
