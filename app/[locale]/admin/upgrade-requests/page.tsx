import AdminUpgradeRequests from "@/components/admin/upgrade-requests"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the admin upgrade requests page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.admin.upgradeRequests.title"),
    description: t("seo.admin.upgradeRequests.description"),
  })
}

/**
 * A page that displays the admin upgrade requests management.
 */
export default function Page() {
  return <AdminUpgradeRequests />
}
