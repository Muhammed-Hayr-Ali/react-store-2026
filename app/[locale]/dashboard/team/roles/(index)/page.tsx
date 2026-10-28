/**
 * @file app/[locale]/dashboard/roles/page.tsx
 * @description Roles and permissions management dashboard page.
 */

 import { getTranslations } from "next-intl/server"
import { ShieldCheckIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import RolesTable from "@/components/dashboard/roles/roles-table"
import { RolesSummary } from "@/components/dashboard/roles/roles-summary"
 import { getRolesPageData } from "@/lib/actions/role"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "RolesManagement" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("PAGE_META_TITLE"),
    description: t("PAGE_META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "RolesManagement" })
  const tErrors = await getTranslations({ locale, namespace: "ActionErrors" })


  
  // استدعاء دالة جلب البيانات والمعالجة المستقلة
  const pageDataResult = await getRolesPageData()
  if (!pageDataResult.success) {
    throw new Error(
      tErrors(getActionErrorKey(pageDataResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const { roles, summary, isMobile } = pageDataResult.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldCheckIcon className="size-4 text-foreground" />
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

      {/* مكون الملخص الإحصائي الجديد للأدوار */}
      <RolesSummary
        totalCount={summary.total}
        activeCount={summary.active}
        emptyCount={summary.empty}
        totalLabel={t("TOTAL_ROLES_COUNT")}
        activeLabel={t("ACTIVE_ROLES_COUNT")}
        emptyLabel={t("EMPTY_ROLES_COUNT")}
      />

      <RolesTable initialRoles={roles} initialIsMobile={isMobile} />
    </div>
  )
}
