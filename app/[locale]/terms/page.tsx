import { createMetadata } from "@/lib/config/metadata_generator"
import { TermsPageContent } from "@/components/legal/terms-content"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.terms.title"),
    description: t("seo.terms.description"),
  })
}

export default function Page() {
  return <TermsPageContent />
}
