"use client"

import { useCallback, useEffect, useState } from "react"

import { Bell, Package, ShoppingCart, Tag, TrendingUp } from "lucide-react"

import { createBrowserClient } from "@/lib/supabase/createBrowserClient"
import {
  markAllAsRead,
  markNotificationAsRead,
} from "@/lib/actions/notifications/notifications"

import type { Notification } from "./types"
import {
  NotificationDropdown,
  NotificationDropdownTrigger,
  NotificationDropdownContent,
  NotificationTriggerIcon,
  NotificationHeader,
  NotificationTitle,
  NotificationAction,
  NotificationBody,
  NotificationEmpty,
  NotificationItem,
  NotificationItemHeader,
  NotificationItemTitle,
  NotificationItemUnreadDot,
  NotificationItemDescription,
  NotificationItemTime,
} from "@/components/ui/notification-dropdown"

interface NotificationBellProps {
  initialNotifications?: Notification[]
}

export default function NotificationBell({
  initialNotifications = [],
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [open, setOpen] = useState(false)
  const supabase = createBrowserClient()

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    // Fetch notifications if no initial data
    if (initialNotifications.length === 0) {
      const fetchNotifications = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (data) {
          setNotifications(data)
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

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  const handleMarkAll = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

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

  /**
   * Returns the appropriate icon for a notification based on its type.
   *
   * @param type - The notification type: 'order', 'promo', 'sale', 'analytics', or other
   * @returns JSX.Element - The corresponding Lucide icon with styling
   *
   * @example
   * getNotificationIcon('order')     // Returns Package icon (blue)
   * getNotificationIcon('promo')     // Returns Tag icon (green)
   * getNotificationIcon('sale')      // Returns ShoppingCart icon (orange)
   * getNotificationIcon('analytics') // Returns TrendingUp icon (purple)
   * getNotificationIcon('info')      // Returns Bell icon (gray - default)
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        // Order notifications: new orders, order updates, shipping
        return <Package className="h-4 w-4 text-blue-500" />

      case "promo":
        // Promotional notifications: discounts, special offers, coupons
        return <Tag className="h-4 w-4 text-green-500" />

      case "sale":
        // Sales notifications: new sales, products sold, revenue
        return <ShoppingCart className="h-4 w-4 text-orange-500" />

      case "analytics":
        // Analytics notifications: reports, statistics, performance metrics
        return <TrendingUp className="h-4 w-4 text-purple-500" />

      default:
        // Default icon for: 'info' or any unrecognized type
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <NotificationDropdown open={open} onOpenChange={setOpen}>
      <NotificationDropdownTrigger asChild>
        <NotificationTriggerIcon unreadCount={unreadCount} />
      </NotificationDropdownTrigger>
      <NotificationDropdownContent>
        <NotificationHeader>
          <NotificationTitle>الإشعارات</NotificationTitle>
          {unreadCount > 0 && (
            <NotificationAction onClick={handleMarkAll}>
              تحديد الكل كمقروء
            </NotificationAction>
          )}
        </NotificationHeader>
        <NotificationBody>
          {notifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                unread={!notification.is_read}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <NotificationItemHeader>
                      <NotificationItemTitle>
                        {notification.title}
                      </NotificationItemTitle>
                      {!notification.is_read && <NotificationItemUnreadDot />}
                    </NotificationItemHeader>
                    <NotificationItemDescription>
                      {notification.message}
                    </NotificationItemDescription>
                    <NotificationItemTime dateTime={notification.created_at}>
                      {new Date(notification.created_at).toLocaleTimeString(
                        "ar-SA",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </NotificationItemTime>
                  </div>
                </div>
              </NotificationItem>
            ))
          )}
        </NotificationBody>
      </NotificationDropdownContent>
    </NotificationDropdown>
  )
}
