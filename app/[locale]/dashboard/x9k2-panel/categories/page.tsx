/**
 * @file app/[locale]/dashboard/x9k2-panel/categories/page.tsx
 * @description Standard Server Component page compliant with Section 1 of UI/UX Architecture Standards.
 */

import { notFound } from "next/navigation"
import { FolderTreeIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import {
  getAllCategories,
  getCategoriesSelector,
  getCategoriesSummary,
} from "@/lib/actions/categories"
import { CategoriesSummaryCards } from "@/components/dashboard/categories/categories-summary-cards"
import { CategoriesTable } from "@/components/dashboard/categories/categories-table"

interface PageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    status?: string
    parent_id?: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "CategoriesManagement" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("METADATA_TITLE"),
    description: t("METADATA_DESCRIPTION"),
  })
}

export default async function CategoriesManagementPage({
  params,
  searchParams,
}: PageProps) {
  // 1. Mandatory View Permission Guard
  const canView = await hasPermission(PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const t = await getTranslations({ locale, namespace: "CategoriesManagement" })

  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 20
  const search = resolvedSearchParams.search || undefined
  const parentId = resolvedSearchParams.parent_id || undefined
  const statusParam = resolvedSearchParams.status
  const isActive =
    statusParam === "active"
      ? true
      : statusParam === "inactive"
        ? false
        : undefined

  const [categoriesRes, summaryRes, selectorRes] = await Promise.all([
    getAllCategories({
      page,
      limit,
      search,
      parent_id: parentId,
      is_active: isActive,
    }),
    getCategoriesSummary(),
    getCategoriesSelector({ activeOnly: false }),
  ])

  const categories =
    categoriesRes.success && categoriesRes.data ? categoriesRes.data.items : []
  const totalCount =
    categoriesRes.success && categoriesRes.data ? categoriesRes.data.total : 0
  const summary = summaryRes.success ? summaryRes.data : null
  const selectorItems = selectorRes.success ? selectorRes.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Page Header (1:1 with Section 1 Template) */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <FolderTreeIcon className="size-4 text-foreground" />
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

      {/* Summary Cards */}
      {summary && <CategoriesSummaryCards summary={summary} />}

      {/* Interactive Data Table with Toolbar CTA */}
      <CategoriesTable
        initialData={categories}
        totalCount={totalCount}
        parentOptions={selectorItems}
      />
    </div>
  )
}
