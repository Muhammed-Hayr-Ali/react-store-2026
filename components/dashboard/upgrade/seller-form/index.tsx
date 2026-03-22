import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import SellerFormWithPlan from "@/components/dashboard/upgrade/seller-form"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.sellerForm.title"),
    description: t("seo.dashboard.sellerForm.description"),
  })
}

export default function Page() {
  return <SellerFormWithPlan />
}
