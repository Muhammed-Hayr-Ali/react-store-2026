import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import DeliveryFormWithPlan from "@/components/dashboard/upgrade/delivery-form"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.deliveryForm.title"),
    description: t("seo.dashboard.deliveryForm.description"),
  })
}

export default function Page() {
  return <DeliveryFormWithPlan />
}
