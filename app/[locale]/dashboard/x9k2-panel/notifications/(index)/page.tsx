import { BellIcon } from "lucide-react"

import { getAdminNotifications } from "@/lib/actions/notifications/queries/get-admin-notifications"
import { getAdminUsersList } from "@/lib/actions/users/queries/get-admin-users"
import { AdminNotificationsTable } from "@/components/dashboard/notifications/admin-notifications-table"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

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
  await params
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
              Notifications Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Review and manage all user notifications and system alerts.
          </p>
        </div>
      </div>

      <AdminNotificationsTable notifications={notifications} users={users} />
    </div>
  )
}
