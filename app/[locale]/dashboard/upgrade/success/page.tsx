import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import UpgradeSuccess from "@/components/dashboard/upgrade/success"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.success.title"),
    description: t("seo.dashboard.success.description"),
  })
}

export default function Page() {
  return <UpgradeSuccess />
}
