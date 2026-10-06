import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { notFound } from "next/navigation"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Dashboard Overview",
    description:
      "Admin overview for Marketna. Monitor sales performance, metrics, and store activity.",
  })
}

export default async function DashboardOverviewPage() {
  const canView = await hasPermission(PERMISSIONS.VIEW_ADMIN_OVERVIEW)
  if (!canView) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="aspect-video rounded-xl border border-border bg-card p-4 shadow-xs" />
        <div className="aspect-video rounded-xl border border-border bg-card p-4 shadow-xs" />
        <div className="aspect-video rounded-xl border border-border bg-card p-4 shadow-xs" />
      </div>

      <div className="min-h-100 flex-1 rounded-xl border border-border bg-card p-6 shadow-xs" />
    </div>
  )
}
