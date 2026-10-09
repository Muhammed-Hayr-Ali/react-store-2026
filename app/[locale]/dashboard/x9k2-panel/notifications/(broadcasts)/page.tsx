import { notFound } from "next/navigation"
import Link from "next/link"
import { BellIcon, RadioTowerIcon } from "lucide-react"

import { getAdminNotifications } from "@/lib/actions/notifications"
import { getAdminUsersList } from "@/lib/actions/users/queries/get-admin-users"
import { AdminNotificationsTable } from "@/components/dashboard/notifications/broadcasts/admin-notifications-table"
import { Button } from "@/components/ui/button"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"

interface PageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    type?: string
    isRead?: string
    limit?: string
    offset?: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Notifications Management",
    description: "Manage system notifications and broadcast alerts.",
  })
}

export default async function AdminNotificationsPage({
  params,
  searchParams,
}: PageProps) {
  const canView = await hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  const { locale } = await params
  await searchParams

  const [notificationsRes, usersRes] = await Promise.all([
    getAdminNotifications(),
    getAdminUsersList({ status: "active" }),
  ])

  const notifications =
    notificationsRes.success && notificationsRes.data
      ? notificationsRes.data
      : []

  const users =
    usersRes.success && usersRes.data
      ? usersRes.data.map((u) => ({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
        }))
      : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <BellIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Notifications & Broadcasts
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Review and manage all user notifications, logs, and mass system alerts.
          </p>
        </div>

        {/* زر الانتقال المباشر لصفحة القنوات */}
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href={`/${locale}/dashboard/x9k2-panel/notifications/channels`}>
              <RadioTowerIcon className="size-3.5" />
              <span>Channels Setup</span>
            </Link>
          </Button>
        </div>
      </div>

      <AdminNotificationsTable notifications={notifications} users={users} />
    </div>
  )
}