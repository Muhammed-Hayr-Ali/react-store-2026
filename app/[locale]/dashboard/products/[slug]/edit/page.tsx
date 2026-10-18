import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { PackageIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
import { getCategories, type Category } from "@/lib/actions/categories"
import ProductForm from "@/components/dashboard/product/product-form"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { getBrands } from "@/lib/actions/brands"
import type { BrandRecord } from "@/lib/actions/brands/types"
import { getActionErrorKey } from "@/lib/actions/error-keys"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })
  const result = await getProductCompleteBySlug(slug, { activeOnly: false })

  const productName =
    result.success && result.data ? result.data.name : t("UPDATE_PAGE_TITLE")

  return createMetadata({
    siteName: appConfig.name,
    title: t("UPDATE_PAGE_META_TITLE", { name: productName }),
    description: t("UPDATE_PAGE_META_DESCRIPTION", { name: productName }),
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })
  const tErrors = await getTranslations({ locale, namespace: "ActionErrors" })
  const canView = await hasPermission(PERMISSIONS.UPDATE_PRODUCT)
  if (!canView) {
    console.warn("[product edit page] Access denied", {
      slug,
      requiredPermission: PERMISSIONS.UPDATE_PRODUCT,
    })
    notFound()
  }

  const [productResult, categoriesResult, brandsResult] = await Promise.all([
    getProductCompleteBySlug(slug, { activeOnly: false }),
    getCategories(),
    getBrands(),
  ])

  if (!productResult.success || !productResult.data) {
    console.error("[product edit page] Failed to load product", {
      slug,
      error: productResult.success
        ? "PRODUCT_NOT_FOUND"
        : productResult.error,
      details: productResult.success ? undefined : productResult.details,
    })
    notFound()
  }

  if (!categoriesResult.success) {
    console.error("[product edit page] Failed to load categories", {
      slug,
      error: categoriesResult.error,
      details: categoriesResult.details,
    })
    throw new Error(tErrors(getActionErrorKey(categoriesResult.error)))
  }

  if (!brandsResult.success) {
    console.error("[product edit page] Failed to load brands", {
      slug,
      error: brandsResult.error,
      details: brandsResult.details,
    })
    throw new Error(tErrors(getActionErrorKey(brandsResult.error)))
  }

  const categories: Category[] = categoriesResult.data
  const brands: BrandRecord[] = brandsResult.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("UPDATE_PAGE_TITLE")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("UPDATE_PAGE_DESCRIPTION")}
          </p>
        </div>
      </div>

      <ProductForm
        product={productResult.data}
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
