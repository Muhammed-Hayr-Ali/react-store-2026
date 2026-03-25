"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import {
  Bell,
  CheckCheck,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
} from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  getNotifications,
  markAllAsRead,
  markNotificationAsRead,
  deleteAllNotifications,
  deleteReadNotifications,
} from "@/lib/actions/notifications"

import type { Notification } from "./types"
import {
  NotificationDropdown,
  NotificationDropdownTrigger,
  NotificationDropdownContent,
  NotificationTriggerIcon,
  NotificationHeader,
  NotificationBody,
  NotificationEmpty,
  NotificationItem,
  NotificationItemIcon,
  NotificationItemTitle,
  NotificationItemDescription,
  NotificationItemTime,
  NotificationItemColorDot,
  NotificationTabs,
} from "@/components/ui/notification-dropdown"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash, Trash2 } from "lucide-react"

interface NotificationBellProps {
  initialNotifications?: Notification[]
}

export default function NotificationBell({
  initialNotifications = [],
}: NotificationBellProps) {
  const locale = useLocale()
  const t = useTranslations("Notifications")
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"today" | "week" | "earlier">(
    "today"
  )
  const supabase = createBrowserClient()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Filter notifications based on active tab
  const displayNotifications = notifications.filter((notification) => {
    const now = new Date()
    const notificationDate = new Date(notification.created_at)
    const diffHours =
      (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60)
    const diffDays = diffHours / 24

    if (activeTab === "today") {
      return diffHours <= 24
    }
    if (activeTab === "week") {
      return diffHours > 24 && diffDays <= 7
    }
    // earlier
    return diffDays > 7
  })

  useEffect(() => {
    // Fetch notifications if no initial data
    if (initialNotifications.length === 0) {
      const fetchNotifications = async () => {
        const result = await getNotifications()
        if (result.success && result.data) {
          setNotifications(result.data)
        }
      }

      fetchNotifications()
    }

    // Subscribe to Realtime updates
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, initialNotifications])

  const handleMarkAsRead = useCallback(async (id: string) => {
    const result = await markNotificationAsRead(id)
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    const result = await markAllAsRead()
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }, [])

  const handleDeleteAll = useCallback(async () => {
    const result = await deleteAllNotifications()
    if (result.success) {
      setNotifications([])
    }
  }, [])

  const handleDeleteRead = useCallback(async () => {
    const result = await deleteReadNotifications()
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => !n.is_read))
    }
  }, [])

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        handleMarkAsRead(notification.id)
      }
      // Handle link navigation if exists
      if (notification.link) {
        window.location.href = notification.link
      }
    },
    [handleMarkAsRead]
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        // Order notifications: new orders, order updates, shipping
        return {
          icon: <Package className="h-4 w-4" />,
          dotColor: "bg-blue-500",
        }

      case "promo":
        // Promotional notifications: discounts, special offers, coupons
        return {
          icon: <Tag className="h-4 w-4" />,
          dotColor: "bg-green-500",
        }

      case "sale":
        // Sales notifications: new sales, products sold, revenue
        return {
          icon: <ShoppingCart className="h-4 w-4" />,
          dotColor: "bg-orange-500",
        }

      case "analytics":
        // Analytics notifications: reports, statistics, performance metrics
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          dotColor: "bg-purple-500",
        }

      default:
        // Default icon for: 'info' or any unrecognized type
        return {
          icon: <Bell className="h-4 w-4" />,
          dotColor: "bg-gray-400",
        }
    }
  }

  /**
   * Formats the notification time to show relative time (e.g., "1h ago", "3h ago")
   *
   * @param dateString - ISO date string
   * @returns Formatted relative time string
   */
  const formatNotificationTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) {
      return t("time.now")
    } else if (diffMins < 60) {
      return t("time.minutesAgo", { minutes: diffMins })
    } else if (diffHours < 24) {
      return t("time.hoursAgo", { hours: diffHours })
    } else if (diffDays < 7) {
      return t("time.daysAgo", { days: diffDays })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <NotificationDropdown open={open} onOpenChange={setOpen}>
      <NotificationDropdownTrigger asChild>
        <NotificationTriggerIcon unreadCount={unreadCount} />
      </NotificationDropdownTrigger>
      <NotificationDropdownContent>
        <NotificationHeader
          title={t("title")}
          showSeeAll={false}
          showActions={unreadCount > 0 || notifications.length > 0}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-42"
              align={locale === "ar" ? "start" : "end"}
            >
              <DropdownMenuGroup>
                {/* MARK ALL READ */}

                <DropdownMenuItem
                  disabled={unreadCount === 0}
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="text-xs">{t("actions.markAllRead")}</span>
                </DropdownMenuItem>

                {/* DELETE READ */}

                <DropdownMenuItem
                  disabled={notifications.filter((n) => n.is_read).length === 0}
                  onClick={handleDeleteRead}
                >
                  <Trash className="h-4 w-4" />
                  <span className="text-xs">{t("actions.deleteRead")}</span>
                </DropdownMenuItem>

                {/* DELETE ALL */}
                <DropdownMenuItem
                  disabled={notifications.filter((n) => n.is_read).length === 0}
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs">{t("actions.deleteAll")}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </NotificationHeader>
        <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <NotificationBody>
          {displayNotifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            displayNotifications.map((notification) => {
              const { icon, dotColor } = getNotificationIcon(notification.type)

              return (
                <NotificationItem
                  key={notification.id}
                  unread={!notification.is_read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon with circular background */}
                  <NotificationItemIcon className="absolute inset-s-2 top-1/2 -translate-y-1/2">
                    {icon}
                  </NotificationItemIcon>

                  {/* Content */}
                  <div className="ms-6">
                    <div className="flex items-center gap-2">
                      {/* Color dot - only shows when unread */}
                      {!notification.is_read && (
                        <NotificationItemColorDot className={dotColor} />
                      )}

                      <NotificationItemTitle>
                        {notification.title}
                      </NotificationItemTitle>

                      {/* Time on the opposite side */}
                      <NotificationItemTime dateTime={notification.created_at}>
                        {formatNotificationTime(notification.created_at)}
                      </NotificationItemTime>
                    </div>

                    <NotificationItemDescription>
                      {notification.message}
                    </NotificationItemDescription>
                  </div>
                </NotificationItem>
              )
            })
          )}
        </NotificationBody>
      </NotificationDropdownContent>
    </NotificationDropdown>
  )
}
