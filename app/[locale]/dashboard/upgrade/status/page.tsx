import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import UpgradeStatus from "@/components/dashboard/upgrade/status"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.status.title"),
    description: t("seo.dashboard.status.description"),
  })
}

export default function Page() {
  return <UpgradeStatus />
}
