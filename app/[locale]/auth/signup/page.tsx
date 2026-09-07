import { SignUpForm } from "@/components/auth/signup-form"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Sign Up",
    description:
      "Sign up for your Marketna account to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default function Page() {
  return <SignUpForm />
}
