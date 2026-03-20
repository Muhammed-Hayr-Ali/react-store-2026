import UpgradeSuccess from "@/components/dashboard/upgrade/success"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the upgrade success page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.success.title"),
    description: t("seo.dashboard.success.description"),
  })
}

/**
 * A page that displays the upgrade success message.
 */
export default function Page() {
  return <UpgradeSuccess />
}
