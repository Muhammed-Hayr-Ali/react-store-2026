"use client"

import * as React from "react"
import { toast } from "sonner"
import { BellIcon, LockIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { getUserChannelPreferences } from "@/lib/actions/notifications/queries/get-user-channel-preferences"
import { toggleChannelSubscription } from "@/lib/actions/notifications/mutations/toggle-channel-subscription"
import type { UserChannelPreference } from "@/lib/actions/notifications/types"

interface NotificationPreferencesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPreferencesDialog({
  isOpen,
  onOpenChange,
}: NotificationPreferencesDialogProps) {
  const [preferences, setPreferences] = React.useState<UserChannelPreference[]>(
    []
  )
  const [isLoading, startLoadTransition] = React.useTransition()
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isSubscribed = true

    if (isOpen) {
      startLoadTransition(async () => {
        const res = await getUserChannelPreferences()
        if (isSubscribed && res.success && res.data) {
          setPreferences(res.data)
        }
      })
    }

    return () => {
      isSubscribed = false
    }
  }, [isOpen])

  const handleToggle = async (channel: UserChannelPreference) => {
    if (channel.is_mandatory) return

    const nextState = !channel.is_subscribed
    setTogglingId(channel.id)

    // Optimistic UI update
    setPreferences((prev) =>
      prev.map((item) =>
        item.id === channel.id ? { ...item, is_subscribed: nextState } : item
      )
    )

    try {
      const res = await toggleChannelSubscription(channel.id, nextState)
      if (!res.success) {
        // Rollback on failure
        setPreferences((prev) =>
          prev.map((item) =>
            item.id === channel.id
              ? { ...item, is_subscribed: !nextState }
              : item
          )
        )
        toast.error("Failed to update notification setting")
      } else {
        toast.success("Notification setting updated")
      }
    } catch {
      // Rollback on error
      setPreferences((prev) =>
        prev.map((item) =>
          item.id === channel.id ? { ...item, is_subscribed: !nextState } : item
        )
      )
      toast.error("Failed to update notification setting")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4 text-primary" />
            <DialogTitle className="text-base font-semibold">
              Notification Channels
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage topics and updates you want to receive from our store.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Spinner className="size-5" />
              <span className="text-xs">Loading preferences...</span>
            </div>
          ) : preferences.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No channels available.
            </p>
          ) : (
            <div className="space-y-4">
              {preferences.map((channel) => {
                const isBusy = togglingId === channel.id

                return (
                  <div
                    key={channel.id}
                    className="flex items-start justify-between gap-4 rounded-xl border p-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {channel.name}
                        </span>
                        {channel.is_mandatory && (
                          <span
                            title="Mandatory for system and order updates"
                            className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            <LockIcon className="mr-1 size-2.5" />
                            Required
                          </span>
                        )}
                      </div>
                      {channel.description && (
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          {channel.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <Switch
                        checked={channel.is_subscribed}
                        disabled={channel.is_mandatory || isBusy}
                        onCheckedChange={() => handleToggle(channel)}
                        aria-label={`Toggle ${channel.name}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
