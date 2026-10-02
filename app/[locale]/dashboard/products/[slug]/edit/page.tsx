import { notFound } from "next/navigation"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
import { Category, getAllCategories } from "@/lib/actions/categories"
import { getAllBrand } from "@/lib/actions/brands/queries/get-all"
import { Brand } from "@/lib/actions/brands"
import UpdateProductForm from "@/components/dashboard/products/update/update-product-form"


export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await getProductCompleteBySlug(slug)

  const productName =
    result.success && result.data ? result.data.name : "Update Product"

  return createMetadata({
    siteName: appConfig.name,
    title: `Update ${productName} - Dashboard`,
    description: `Update specifications, variants, media, and inventory for ${productName}.`,
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 1. جلب بيانات المنتج والتصنيفات والعلامات التجارية بالتوازي
  const [productResult, categoriesResult, brandsResult] = await Promise.all([
    getProductCompleteBySlug(slug, { activeOnly: false }),
    getAllCategories({ activeOnly: true }),
    getAllBrand(),
  ])

  // 2. التحقق من وجود المنتج
  if (!productResult.success || !productResult.data) {
    notFound()
  }

  // 3. استخراج التصنيفات والعلامات التجارية مع حماية من الأخطاء
  const categories: Category[] =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : []

  const brands: Brand[] =
    brandsResult.success && brandsResult.data ? brandsResult.data : []

  return (
    <div className="flex w-full flex-1 flex-col">
      <UpdateProductForm
        product={productResult.data}
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
