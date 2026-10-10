/**
 * @file app/[locale]/dashboard/x9k2-panel/categories/page.tsx
 * @description Categories management dashboard page with strict server-side view permission guarding,
 * zero-trust routing, dynamic localized metadata, and concurrent data hydration.
 */

import { notFound } from "next/navigation"
import { FolderTreeIcon, PlusIcon } from "lucide-react"
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
import { Can } from "@/components/shared/can"
import { Button } from "@/components/ui/button"
import { CategoryFormSheet } from "@/components/dashboard/categories/category-form-sheet"
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

// 1. توليد الميتاداتا المعربة ديناميكياً بدون أي نصوص ثابتة
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
  // 2. فحص أمني استباقي في السطر الأول (Zero-Trust Guard)
  const canView = await hasPermission(PERMISSIONS.VIEW_CATEGORIES_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  // 3. فك المعاملات غير المتزامنة والترجمة
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const t = await getTranslations({ locale, namespace: "CategoriesManagement" })

  // 4. استخراج وتنظيف معاملات الفلترة والترقيم
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

  // 5. جلب البيانات المتزامنة بالتوازي (Concurrent Data Hydration)
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
      {/* رأس الصفحة مع زر الإجراء المزدوج المتجاوب */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
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

        {/* زر الإضافة محمي بالصلاحية ومتجاوب بالكامل */}
        <Can permission={PERMISSIONS.CREATE_CATEGORY}>
          <CategoryFormSheet parentOptions={selectorItems}>
            {/* عرض الجوال: أيقونة فقط */}
            <Button
              className="size-8 sm:hidden"
              size="icon"
              title={t("ADD_CATEGORY")}
              variant="default"
            >
              <PlusIcon className="size-3.5" />
              <span className="sr-only">{t("ADD_CATEGORY")}</span>
            </Button>

            {/* عرض الشاشات الأكبر: أيقونة مع نص */}
            <Button
              className="hidden h-8 gap-1.5 px-3 text-xs sm:inline-flex"
              size="sm"
              variant="default"
            >
              <PlusIcon className="size-3.5" />
              <span>{t("ADD_CATEGORY")}</span>
            </Button>
          </CategoryFormSheet>
        </Can>
      </div>

      {/* بطاقات الملخص الإحصائي */}
      {summary && <CategoriesSummaryCards summary={summary} />}

      {/* جدول البيانات التفاعلي مع دعم الفلترة وإخفاء الأعمدة */}
      <CategoriesTable
        initialData={categories}
        totalCount={totalCount}
        parentOptions={selectorItems}
      />
    </div>
  )
}
