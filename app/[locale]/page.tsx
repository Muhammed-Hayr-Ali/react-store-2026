import ComingSoonPage from "@/components/common-soon/common-soon"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.home.title"),
    description: t("seo.home.description"),
  })
}

export default function Page() {
  return (
    <ComingSoonPage/>
  )
}
