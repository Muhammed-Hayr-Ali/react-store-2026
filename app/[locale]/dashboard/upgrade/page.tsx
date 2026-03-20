import UpgradeAccount from "@/components/dashboard/upgrade-account"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the upgrade account page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.upgrade.title"),
    description: t("seo.dashboard.upgrade.description"),
  })
}

/**
 * A page that displays the upgrade account form.
 */
export default function Page() {
  return <UpgradeAccount />
}
