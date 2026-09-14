import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"
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
  // جلب البيانات بشكل متوازي للأداء الأفضل
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategories(),
    getBrands(),
  ]) 

  return (
    <CreateProductForm
      categories={categoriesRes.success ? categoriesRes.data : []}
      brands={brandsRes.success ? brandsRes.data : []}
    />
  )
}
