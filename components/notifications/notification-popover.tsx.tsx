"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/actions/notifications"
import { NotificationBell } from "./notification-bell"
import { appRoutes } from "@/lib/config/app-routes"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCheckIcon, Trash2Icon, ExternalLinkIcon } from "lucide-react"

interface NotificationPopoverProps {
  initialNotifications?: NotificationRecord[]
  initialUnreadCount?: number
  currentUserId?: string
}

export function NotificationPopover({
  initialNotifications = [],
  initialUnreadCount = 0,
  currentUserId,
}: NotificationPopoverProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  // مزامنة الحالة مع الـ props بدون useEffect لتجنب Cascading Renders
  const [data, setData] =
    React.useState<NotificationRecord[]>(initialNotifications)
  const [prevInitialNotifications, setPrevInitialNotifications] =
    React.useState<NotificationRecord[]>(initialNotifications)

  const [unreadCount, setUnreadCount] = React.useState(initialUnreadCount)
  const [prevInitialUnreadCount, setPrevInitialUnreadCount] =
    React.useState(initialUnreadCount)

  const [isOpen, setIsOpen] = React.useState(false)

  if (initialNotifications !== prevInitialNotifications) {
    setPrevInitialNotifications(initialNotifications)
    setData(initialNotifications)
  }

  if (initialUnreadCount !== prevInitialUnreadCount) {
    setPrevInitialUnreadCount(initialUnreadCount)
    setUnreadCount(initialUnreadCount)
  }

  const handleMarkAsRead = async (id: string) => {
    setData((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await markNotificationAsRead(id)
    router.refresh()
  }

  const handleMarkAllAsRead = async () => {
    setData((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await markAllNotificationsAsRead()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const target = data.find((n) => n.id === id)
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setData((prev) => prev.filter((n) => n.id !== id))
    await deleteNotification(id)
    router.refresh()
  }

  const handleDeleteAll = async () => {
    setData([])
    setUnreadCount(0)
    await deleteAllNotifications()
    router.refresh()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          <NotificationBell unreadCount={unreadCount} />
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <CheckCheckIcon className="size-3.5" />
              </Button>
            )}
            {data.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={handleDeleteAll}
                title="Clear all"
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {data.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {data.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex flex-col gap-1 p-4 transition-colors hover:bg-muted/40 ${
                    !item.is_read ? "bg-muted/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-medium ${
                        !item.is_read
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.message}
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/70">
                      {new Date(item.created_at).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => {
                            if (!item.is_read) handleMarkAsRead(item.id)
                            setIsOpen(false)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <span>View</span>
                          <ExternalLinkIcon className="size-2.5" />
                        </Link>
                      )}

                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2 text-center">
          <Link
            href={`/${locale}${appRoutes.dashboard.user.notifications}`}
            onClick={() => setIsOpen(false)}
            className="text-xs text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
