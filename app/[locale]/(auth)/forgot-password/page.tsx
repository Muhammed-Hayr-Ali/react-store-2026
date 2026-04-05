import { createMetadata } from "@/lib/config/metadata_generator"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.forgotPassword.title"),
    description: t("seo.auth.forgotPassword.description"),
  })
}

export default function Page() {
  return <ForgotPasswordForm />
}
