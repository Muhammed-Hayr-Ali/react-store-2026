import UpgradeDeliveryForm from "@/components/dashboard/upgrade/delivery-form"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the delivery form page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.deliveryForm.title"),
    description: t("seo.dashboard.deliveryForm.description"),
  })
}

/**
 * A page that displays the delivery partner information form.
 */
export default function Page() {
  return <UpgradeDeliveryForm />
}
