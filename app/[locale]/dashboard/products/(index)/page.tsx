import { headers } from "next/headers"
import { PackageIcon } from "lucide-react"

import { getAdminProductsList } from "@/lib/actions/products/queries/get-admin-products-list"
import { getAdminProductsSummary } from "@/lib/actions/products/queries/get-admin-products-summary"
import type { AdminProductSummary } from "@/lib/actions/products/types"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import {} from "@/lib/config/app-routes"
import { DataTable } from "@/components/dashboard/product/products-table"
import { ProductsSummary } from "@/components/dashboard/product/products-summary"
import { getTranslations } from "next-intl/server"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"
 
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })
  return createMetadata({
    siteName: appConfig.name,
    title: t("PAGE_TITLE"),
    description: t("PAGE_DESCRIPTION"),
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {

    const canView = await hasPermission(PERMISSIONS.MANAGE_PRODUCTS)
  
  if (!canView) {
    notFound()
  }



  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "ProductsManagement" })

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  const [result, summaryResult] = await Promise.all([
    getAdminProductsList(),
    getAdminProductsSummary(),
  ])
  if (!result.success) {
    console.error("[products page] Failed to load products", {
      error: result.error,
      details: result.details,
    })
    throw new Error(t(getActionErrorKey(result.error)))
  }

  if (!summaryResult.success) {
    console.error("[products page] Failed to load product summary", {
      error: summaryResult.error,
      details: summaryResult.details,
    })
    throw new Error(t(getActionErrorKey(summaryResult.error)))
  }

  const products: AdminProductSummary[] = result.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("PAGE_TITLE")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("PAGE_DESCRIPTION")}
          </p>
        </div>
      </div>

      <ProductsSummary
        activeCount={summaryResult.data.active}
        lowStockCount={summaryResult.data.lowStock}
        expiringSoonCount={summaryResult.data.expiringSoon}
        activeLabel={t("ACTIVE_COUNT")}
        lowStockLabel={t("LOW_STOCK_COUNT")}
        expiringSoonLabel={t("EXPIRING_SOON_COUNT")}
      />

      <DataTable data={products} initialIsMobile={isMobile} />
    </div>
  )
}
