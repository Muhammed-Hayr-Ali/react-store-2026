import UpgradeDeliveryPlans from "@/components/dashboard/upgrade/delivery-plans"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the delivery plans page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.deliveryPlans.title"),
    description: t("seo.dashboard.deliveryPlans.description"),
  })
}

/**
 * A page that displays the delivery partner subscription plans.
 */
export default function Page() {
  return <UpgradeDeliveryPlans />
}
