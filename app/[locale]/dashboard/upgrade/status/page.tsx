import UpgradeStatus from "@/components/dashboard/upgrade/status"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the upgrade status page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.status.title"),
    description: t("seo.dashboard.status.description"),
  })
}

/**
 * A page that displays the upgrade request status.
 */
export default function Page() {
  return <UpgradeStatus />
}
