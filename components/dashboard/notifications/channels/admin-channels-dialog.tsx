"use client"

import * as React from "react"
import {
  RadioTowerIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  LockIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { getActiveNotificationChannels } from "@/lib/actions/notifications"
import type { NotificationChannelRecord } from "@/lib/actions/notifications/types"
import { ChannelFormSheet } from "./channel-form-sheet"
import { DeleteChannelDialog } from "./delete-channel-dialog"

export function AdminChannelsDialog() {
  const [open, setOpen] = React.useState(false)
  const [channels, setChannels] = React.useState<NotificationChannelRecord[]>([])
  const [isLoading, startTransition] = React.useTransition()

  const loadChannels = React.useCallback(() => {
    startTransition(async () => {
      const res = await getActiveNotificationChannels()
      if (res.success && res.data) {
        setChannels(res.data)
      }
    })
  }, [])

  React.useEffect(() => {
    if (open) {
      loadChannels()
    }
  }, [open, loadChannels])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs"
        >
          <RadioTowerIcon className="size-3.5" />
          <span className="hidden sm:inline">Channels</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="border-b bg-card px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                Notification Channels
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage, edit, or create audience channels.
              </DialogDescription>
            </div>
            <ChannelFormSheet
              onSuccess={loadChannels}
              trigger={
                <Button size="sm" className="h-7 gap-1 text-xs px-2.5">
                  <PlusIcon className="size-3" />
                  <span>New</span>
                </Button>
              }
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Spinner className="size-5" />
              <span className="text-xs">Loading channels...</span>
            </div>
          ) : channels.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">
              No channels created yet.
            </p>
          ) : (
            channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {channel.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      ({channel.slug})
                    </span>
                    {channel.is_mandatory && (
                      <Badge variant="secondary" className="px-1 py-0 text-[10px] gap-1">
                        <LockIcon className="size-2.5" />
                        Mandatory
                      </Badge>
                    )}
                  </div>
                  {channel.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {channel.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <ChannelFormSheet
                    channel={channel}
                    onSuccess={loadChannels}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    }
                  />

                  {!channel.is_mandatory && (
                    <DeleteChannelDialog
                      channel={channel}
                      onSuccess={loadChannels}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}