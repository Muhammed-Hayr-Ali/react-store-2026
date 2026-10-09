"use client"

import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"
import { SlidersHorizontalIcon, LockIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  getUserChannelPreferences,
  toggleChannelSubscription,
} from "@/lib/actions/notifications"
import type { UserChannelPreference } from "@/lib/actions/notifications/types"

interface NotificationPreferencesDialogProps {
  trigger?: React.ReactNode
}

export function NotificationPreferencesDialog({
  trigger,
}: NotificationPreferencesDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [channels, setChannels] = React.useState<UserChannelPreference[]>([])
  const [isPending, startTransition] = useTransition()
  const [isUpdating, startUpdateTransition] = useTransition()

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      startTransition(async () => {
        try {
          const res = await getUserChannelPreferences()
          if (res.success && res.data) {
            setChannels(res.data)
          } else {
            toast.error("Failed to load notification preferences")
          }
        } catch {
          toast.error("An error occurred while loading preferences")
        }
      })
    }
  }

  const handleToggle = (channelId: string, currentSubscribed: boolean) => {
    const nextState = !currentSubscribed

    // تحديث تفاؤلي فوري في الواجهة
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, is_subscribed: nextState } : c
      )
    )

    startUpdateTransition(async () => {
      // تمرير كائن Payload موحد يطابق toggleSubscriptionSchema
      const res = await toggleChannelSubscription({
        channelId,
        isSubscribed: nextState,
      })

      if (!res.success) {
        // التراجع عند الفشل
        setChannels((prev) =>
          prev.map((c) =>
            c.id === channelId ? { ...c, is_subscribed: currentSubscribed } : c
          )
        )
        toast.error(res.error || "Failed to update channel preference")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontalIcon className="size-3.5" />
            <span>Preferences</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Notification Preferences
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage your topic subscriptions and decide which announcements you
            receive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Spinner className="size-5" />
              <span className="text-xs">Loading preferences...</span>
            </div>
          ) : channels.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No subscription channels available.
            </p>
          ) : (
            channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">
                      {channel.name}
                    </span>
                    {channel.name_ar && (
                      <span
                        className="text-[11px] text-muted-foreground"
                        dir="rtl"
                      >
                        ({channel.name_ar})
                      </span>
                    )}
                    {channel.is_mandatory && (
                      <span title="Mandatory channel">
                        <LockIcon className="size-3 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  {channel.description && (
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                      {channel.description}
                    </p>
                  )}
                </div>

                <Switch
                  checked={channel.is_subscribed}
                  disabled={channel.is_mandatory || isUpdating}
                  onCheckedChange={() =>
                    handleToggle(channel.id, channel.is_subscribed)
                  }
                  aria-label={`Toggle subscription for ${channel.name}`}
                />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
