import { PackageIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { Category, getAllCategories } from "@/lib/actions/categories"
import { getAllBrand } from "@/lib/actions/brands/queries/get-all"
import { Brand } from "@/lib/actions/brands"
import CreateProductForm from "@/components/dashboard/product/product-form"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Create New Product",
    description:
      "Add a new product to Marketna store and manage its variants, inventory, and media.",
  })
}

export default async function Page() {
  const [resultCategories, resultBrands] = await Promise.all([
    getAllCategories({ activeOnly: true }),
    getAllBrand(),
  ])

  let categories: Category[] = []
  let brands: Brand[] = []

  if (resultCategories.success && resultCategories.data) {
    categories = resultCategories.data
  }

  if (resultBrands.success && resultBrands.data) {
    brands = resultBrands.data
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header متطابق مع Flash Sale مع أيقونة PackageIcon في الشارة */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Create Product
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Configure product details, variants, media, and inventory settings.
          </p>
        </div>
      </div>

      {/* Form */}
      <CreateProductForm categories={categories} brands={brands} />
    </div>
  )
}
