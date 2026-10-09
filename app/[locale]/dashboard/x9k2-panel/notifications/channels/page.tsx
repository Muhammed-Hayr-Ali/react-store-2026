import { notFound } from "next/navigation"
import { RadioTowerIcon } from "lucide-react"

import { ChannelsTable } from "@/components/dashboard/notifications/channels/channels-table"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { getAllNotificationChannels } from "@/lib/actions/notifications/channels/queries/get-active-channels"

interface PageProps {
  params?: Promise<{
    locale?: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Notification Channels",
    description:
      "Manage audience topics, opt-in rules, and notification channels.",
  })
}

export default async function ChannelsManagementPage(props: PageProps) {
  const canView = await hasPermission(
    PERMISSIONS.VIEW_NOTIFICATION_CHANNELS_MANAGEMENT
  )
  if (!canView) {
    notFound()
  }

  if (props.params) {
    await props.params
  }

  const channelsRes = await getAllNotificationChannels()
  const channels =
    channelsRes.success && channelsRes.data ? channelsRes.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <RadioTowerIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Notification Channels
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, configure, and manage audience delivery channels and
            policies.
          </p>
        </div>
      </div>

      <ChannelsTable channels={channels} />
    </div>
  )
}
