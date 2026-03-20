import UpgradeSellerPlans from "@/components/dashboard/upgrade/seller-plans"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the seller plans page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.sellerPlans.title"),
    description: t("seo.dashboard.sellerPlans.description"),
  })
}

/**
 * A page that displays the seller subscription plans.
 */
export default function Page() {
  return <UpgradeSellerPlans />
}
