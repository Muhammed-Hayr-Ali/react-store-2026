import { createMetadata } from "@/lib/config/metadata_generator"
import TwoFactorSetupPage from "@/components/auth/two-factor-setup-page"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.twoFactorSetup.title"),
    description: t("seo.auth.twoFactorSetup.description"),
  })
}

export default function Page() {
  return <TwoFactorSetupPage />
}
