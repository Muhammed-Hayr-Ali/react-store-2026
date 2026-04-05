import { createMetadata } from "@/lib/config/metadata_generator"
import { PrivacyPageContent } from "@/components/legal/privacy-content"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.privacy.title"),
    description: t("seo.privacy.description"),
  })
}

export default function Page() {
  return <PrivacyPageContent />
}
