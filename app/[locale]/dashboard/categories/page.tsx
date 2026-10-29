import { getTranslations } from "next-intl/server"
import { TagsIcon } from "lucide-react"

import { CategoriesTable } from "@/components/dashboard/categories/categories-table"
import { CategoriesSummary } from "@/components/dashboard/categories/categories-summary"
import { getCategoriesPageData } from "@/lib/actions/categories/queries/get-categories-page-data"
import { getCategoriesSummary } from "@/lib/actions/categories/queries/get-categories-summary"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "CategoriesManagement",
  })
  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const canView = await hasPermission(PERMISSIONS.MANAGE_CATEGORIES)
  if (!canView) {
    notFound()
  }

  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "CategoriesManagement",
  })
  const tErrors = await getTranslations({
    locale,
    namespace: "ActionErrors",
  })

  // Fetch pre-processed page data and business logic
  const [pageDataResult, summaryResult] = await Promise.all([
    getCategoriesPageData(),
    getCategoriesSummary(),
  ])
  if (!pageDataResult.success) {
    throw new Error(
      tErrors(getActionErrorKey(pageDataResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  if (!summaryResult.success) {
    throw new Error(
      tErrors(getActionErrorKey(summaryResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const { categories, categoryImages, isMobile } = pageDataResult.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <TagsIcon className="size-4 text-foreground" />
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

      <CategoriesSummary
        totalCount={summaryResult.data.total}
        activeCount={summaryResult.data.active}
        inactiveCount={summaryResult.data.inactive}
        totalLabel={t("TOTAL_COUNT")}
        activeLabel={t("ACTIVE_COUNT")}
        inactiveLabel={t("INACTIVE_COUNT")}
      />

      <CategoriesTable
        initialCategories={categories}
        categoryImages={categoryImages}
        initialIsMobile={isMobile}
      />
    </div>
  )
}
