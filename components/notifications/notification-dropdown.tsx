"use client"

import { useState, useEffect, useTransition } from "react"
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"
import { Badge } from "@/components/ui/badge"
import { NotificationRecord } from "@/lib/actions/notifications/types"
import { createClient } from "@/lib/database/supabase/client"
import Link from "next/link"
// استيراد الدوال التي يحتاجها العميل فقط مباشرة من مساراتها دون استيراد index العام
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notifications/mutations/mark-read"
import { deleteNotification, deleteAllNotifications } from "@/lib/actions/notifications/mutations/delete"
interface NotificationDropdownProps {
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
  currentUserId: string
}

export function NotificationDropdown({
  initialNotifications,
  initialUnreadCount,
  currentUserId,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // Setup Supabase Realtime subscription with a unique channel per component instance
  useEffect(() => {
    const channelName = `notifications:${currentUserId}:${Math.random().toString(36).substring(2, 9)}`

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationRecord
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, supabase])

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (isRead) return
    startTransition(async () => {
      const res = await markNotificationAsRead(id)
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    })
  }

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsRead()
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    })
  }

  const handleDelete = (id: string, isRead: boolean) => {
    startTransition(async () => {
      const res = await deleteNotification(id)
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        if (!isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    })
  }

  const handleDeleteAll = () => {
    startTransition(async () => {
      const res = await deleteAllNotifications()
      if (res.success) {
        setNotifications([])
        setUnreadCount(0)
      }
    })
  }

  // Helper for badge color based on notification type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    }
  }

  return (
    <CustomPopover open={isOpen} onOpenChange={setIsOpen}>
      <CustomPopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-4 animate-pulse items-center justify-center rounded-full p-0 text-[9px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-80 gap-0 rounded-xl p-0 shadow-lg sm:w-96"
      >
        {/* Header */}
        <CustomPopoverHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
              >
                <CheckCheck className="mr-1 size-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive"
                onClick={handleDeleteAll}
                disabled={isPending}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </CustomPopoverHeader>

        {/* Notifications List */}
        <div className="max-h-[380px] divide-y overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="mb-2 size-8 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex flex-col p-3 transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? "bg-muted/30 font-medium" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${!notification.is_read ? "bg-primary" : "bg-transparent"}`}
                      />
                      <span className="text-xs font-semibold">
                        {notification.title}
                      </span>
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[10px] ${getTypeBadgeColor(notification.type)}`}
                      >
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions per notification */}
                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id,
                            notification.is_read
                          )
                        }
                        title="Mark as read"
                      >
                        <CheckCheck className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleDelete(notification.id, notification.is_read)
                      }
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Footer link if available */}
                {notification.link && (
                  <div className="mt-2 flex items-center justify-between pt-1 text-[11px]">
                    <Link
                      href={notification.link}
                      className="flex items-center gap-1 text-primary hover:underline"
                      onClick={() => {
                        handleMarkAsRead(notification.id, notification.is_read)
                        setIsOpen(false)
                      }}
                    >
                      View details <ExternalLink className="size-3" />
                    </Link>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notification.created_at).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
