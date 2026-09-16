import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import CreateProductForm from "@/components/dashboard/products/create/create-product-form"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "إضافة منتج جديد",
    description:
      "إضافة منتج جديد إلى متجر Marketna مع إدارة التفاصيل الأساسية.",
  })
}

export default async function Page() {

  return (
    <CreateProductForm
    />
  )
}
