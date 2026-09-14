import { LoginForm } from "@/components/auth/login-form"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Login",
    description:
      "Login to your Marketna account to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  const cookieStore = await cookies()
  // check last login method
  const loginMethod  = cookieStore.get("login_method")



  return <LoginForm lastLoginMethod={loginMethod?.value} />
}
