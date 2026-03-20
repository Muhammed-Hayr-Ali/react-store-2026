import { createMetadata } from "@/lib/config/metadata_generator"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.resetPassword.title"),
    description: t("seo.auth.resetPassword.description"),
  })
}

export default function Page() {
  return <ResetPasswordForm />
}
