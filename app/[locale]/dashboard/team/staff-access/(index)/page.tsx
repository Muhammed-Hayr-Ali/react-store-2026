import { UsersIcon } from "lucide-react"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getAllRoles } from "@/lib/actions/role/queries/get-all-roles"
import { getUsersWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import StaffAccessTable from "@/components/dashboard/staff-access/staff-access-table"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "StaffAccessManagement" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("PAGE_META_TITLE"),
    description: t("PAGE_META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "StaffAccessManagement" })

  const canView = await hasPermission(PERMISSIONS.VIEW_STAFF_ACCESS)
  if (!canView) {
    notFound()
  }

  const [usersResult, rolesResult] = await Promise.all([
    getUsersWithRoles(),
    getAllRoles(),
  ])

  const users = usersResult.success && usersResult.data ? usersResult.data : []
  const roles = rolesResult.success && rolesResult.data ? rolesResult.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Use the shared dashboard page header layout. */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
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

      <StaffAccessTable initialUsers={users} availableRoles={roles} />
    </div>
  )
}
