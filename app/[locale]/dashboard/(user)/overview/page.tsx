import { notFound } from "next/navigation"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { Can } from "@/components/shared/can"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "User Overview",
    description:
      "Welcome to your dashboard. View your orders, addresses, and activity.",
  })
}

export default async function UserOverviewPage({ params }: PageProps) {
  await params


    const canView = await hasPermission([PERMISSIONS.VIEW_ADMIN_OVERVIEW, PERMISSIONS.VIEW_USER_OVERVIEW])
    if (!canView) {
      notFound()
    }
  


  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* User Overview */}
      <Can permission={PERMISSIONS.VIEW_USER_OVERVIEW}>
        <>
          <div className="border-b border-border/40 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-xs text-muted-foreground">
              Track your personal orders, active shipments, and saved items.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Total Orders
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Active Deliveries
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Saved Addresses
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
          </div>

          <div className="flex min-h-100 flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground shadow-xs">
            Recent User Orders & Account Activities
          </div>
        </>
      </Can>
      {/* Admin Overview */}
      <Can permission={PERMISSIONS.VIEW_ADMIN_OVERVIEW}>
        <>
          <div className="border-b border-border/40 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Admin Overview
            </h1>
            <p className="text-xs text-muted-foreground">
              Live store statistics, revenue trends, and operational controls.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Total Revenue
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Store Orders
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                Active Customers
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
          </div>

          <div className="flex min-h-100 flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground shadow-xs">
            Platform Analytics & Management Overview Charts
          </div>
        </>
      </Can>
    </div>
  )
}
