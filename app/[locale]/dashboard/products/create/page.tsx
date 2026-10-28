import { PackageIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCategories, type Category } from "@/lib/actions/categories"
import { getBrands, type BrandRecord } from "@/lib/actions/brands"
import ProductForm from "@/components/dashboard/product/product-form"
 import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })
  return createMetadata({
    siteName: appConfig.name,
    title: t("CREATE_PAGE_TITLE"),
    description: t("CREATE_PAGE_DESCRIPTION"),
  })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })

  
  const [resultCategories, resultBrands] = await Promise.all([
    getCategories(),
    getBrands(),
  ])

  let categories: Category[] = []
  let brands: BrandRecord[] = []

  if (resultCategories.success && resultCategories.data) {
    categories = resultCategories.data
  }

  if (resultBrands.success && resultBrands.data) {
    brands = resultBrands.data
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("CREATE_PAGE_TITLE")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("CREATE_PAGE_DESCRIPTION")}
          </p>
        </div>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  )
}
