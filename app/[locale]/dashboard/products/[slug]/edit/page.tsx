import { notFound } from "next/navigation"
import { PackageIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
import { Category, getAllCategories } from "@/lib/actions/categories"
import { getAllBrand } from "@/lib/actions/brands/queries/get-all"
import { Brand } from "@/lib/actions/brands"
import ProductForm from "@/components/dashboard/product/product-form"

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

  const [productResult, categoriesResult, brandsResult] = await Promise.all([
    getProductCompleteBySlug(slug, { activeOnly: false }),
    getAllCategories({ activeOnly: true }),
    getAllBrand(),
  ])

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const categories: Category[] =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : []

  const brands: Brand[] =
    brandsResult.success && brandsResult.data ? brandsResult.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header الترويسة الموحدة */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Update Product
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Modify product specifications, variants, pricing, and media gallery.
          </p>
        </div>
      </div>

      {/* استخدام النموذج الموحد ProductForm مع تمرير بيانات المنتج */}
      <ProductForm
        product={productResult.data}
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
