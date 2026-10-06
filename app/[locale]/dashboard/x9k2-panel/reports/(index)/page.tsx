import { redirect } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"

import { getAllReports } from "@/lib/actions/reports/queries/get-all"
import { ReportStatus, ReportTargetType } from "@/lib/actions/reports/types"
import { hasRole, ROLES } from "@/lib/actions/role"
import { ReportsTable } from "@/components/dashboard/reports/reports-table"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface PageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    status?: string
    targetType?: string
    limit?: string
    offset?: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Reports & Moderation",
    description: "Manage reported items, user reviews, and technical issues.",
  })
}

const VALID_STATUSES: readonly string[] = [
  "pending",
  "under_review",
  "resolved",
  "dismissed",
]
const VALID_TARGET_TYPES: readonly string[] = [
  "product",
  "review",
  "technical_issue",
  "general",
]

export default async function ReportsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const query = await searchParams

  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    redirect(`/${locale}/login`)
  }

  const rawStatus = query.status
  const status: ReportStatus | undefined =
    rawStatus && VALID_STATUSES.includes(rawStatus)
      ? (rawStatus as ReportStatus)
      : undefined

  const rawTargetType = query.targetType
  const targetType: ReportTargetType | undefined =
    rawTargetType && VALID_TARGET_TYPES.includes(rawTargetType)
      ? (rawTargetType as ReportTargetType)
      : undefined

  const limit = query.limit ? parseInt(query.limit, 10) : 20
  const offset = query.offset ? parseInt(query.offset, 10) : 0

  const res = await getAllReports({
    status,
    targetType,
    limit,
    offset,
  })

  const reports = res.success && res.data ? res.data.reports : []
  const total = res.success && res.data ? res.data.total : 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldAlertIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Reports & Moderation
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Review community moderation flags, user reports, and platform
            issues.
          </p>
        </div>
      </div>

      <ReportsTable reports={reports} total={total} />
    </div>
  )
}
