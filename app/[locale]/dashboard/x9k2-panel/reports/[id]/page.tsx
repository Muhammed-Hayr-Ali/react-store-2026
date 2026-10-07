import { notFound } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"

import { getReportById } from "@/lib/actions/reports/queries/get-by-id"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import { ReportDetailsView } from "@/components/dashboard/reports/report-details-view"

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return createMetadata({
    siteName: appConfig.name,
    title: `Report #${id.slice(0, 8)} | Moderation`,
    description: "Inspect and resolve moderation report.",
  })
}

export default async function ReportDetailPage({ params }: PageProps) {
  const canView = await hasPermission(PERMISSIONS.UPDATE_REPORT)
  if (!canView) {
    notFound()
  }

  const { id } = await params

  const res = await getReportById(id)

  if (!res.success || !res.data) {
    notFound()
  }

  const report = res.data

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Navigation Header */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ShieldAlertIcon className="size-4 text-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Report #{report.id.slice(0, 8)}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Submitted on{" "}
            {new Date(report.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <ReportDetailsView report={report} />
    </div>
  )
}
