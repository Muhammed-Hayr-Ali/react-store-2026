import { createMetadata } from "@/lib/config/metadata_generator"
import VerifyForm from "@/components/auth/verify-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.verifyOtp.title"),
    description: t("seo.auth.verifyOtp.description"),
  })
}

export default function Page() {
  return <VerifyForm />
}
