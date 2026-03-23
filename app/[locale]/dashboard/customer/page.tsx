import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.title"),
    description: t("seo.dashboard.description"),
  })
}

export default async function CustomerPage() {
  return <>(customer)</>
}
