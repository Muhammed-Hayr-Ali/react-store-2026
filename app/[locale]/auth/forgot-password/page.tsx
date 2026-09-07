import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Forgot password",
    description: "Forgot password page for Marketna",
  })
}

export default function Page() {
  return <ForgotPasswordForm />
}
