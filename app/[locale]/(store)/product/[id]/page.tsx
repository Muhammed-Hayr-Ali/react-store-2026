import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductCompleteById } from "@/lib/actions/products/queries/get-complete-by-id"
import ProductDetailsPage from "@/components/store/product/ProductDetailsPage/ProductDetailsPage"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface ProductPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getProductCompleteById(id)

  if (!result.success || !result.data) {
    return { title: "منتج غير موجود" }
  }

  // جلب الصورة الأساسية من مصفوفة الصور أو أول صورة متاحة
  const primaryImage =
    result.data.product_images?.find((img) => img.is_primary)?.url ||
    result.data.product_images?.[0]?.url ||
    appConfig.icons.apple ||
    "/logo.png"

  return createMetadata({
    siteName: appConfig.name,
    title: result.data.name,
    description: result.data.meta_description || result.data.name,
    image: primaryImage,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const result = await getProductCompleteById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsPage product={result.data} />
    </main>
  )
}
