import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { UsersIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getUsersPageData } from "@/lib/actions/users/queries/get-users-page-data"
import { UsersTable } from "@/components/dashboard/users/users-table"
import { UsersSummary } from "@/components/dashboard/users/users-summary"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UsersManagement" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "UsersManagement" })
  const tErrors = await getTranslations({ locale, namespace: "ActionErrors" })

  const canView = await hasPermission(PERMISSIONS.VIEW_USERS_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  const pageDataResult = await getUsersPageData()
  if (!pageDataResult.success) {
    throw new Error(
      tErrors(getActionErrorKey(pageDataResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const { users, summary, isMobile } = pageDataResult.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <UsersIcon className="size-4 text-foreground" />
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

      <UsersSummary
        totalCount={summary.total}
        activeCount={summary.active}
        bannedCount={summary.banned}
        totalLabel={t("TOTAL_COUNT")}
        activeLabel={t("ACTIVE_COUNT")}
        bannedLabel={t("BANNED_COUNT")}
      />

      <UsersTable data={users} initialIsMobile={isMobile} />
    </div>
  )
}
