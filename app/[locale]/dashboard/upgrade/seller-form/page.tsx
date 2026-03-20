import UpgradeSellerForm from "@/components/dashboard/upgrade/seller-form"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

/**
 * Generates the metadata for the seller form page.
 */
export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.dashboard.sellerForm.title"),
    description: t("seo.dashboard.sellerForm.description"),
  })
}

/**
 * A page that displays the seller information form.
 */
export default function Page() {
  return <UpgradeSellerForm />
}
