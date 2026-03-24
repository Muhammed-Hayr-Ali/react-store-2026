"use client"

import { useState } from "react"

import { useNotifications } from "@/hooks/useNotifications"

import type { Notification } from "./types"
import { NotificationIcon } from "./NotificationIcon"
import { NotificationList } from "./NotificationList"

interface NotificationBellProps {
  initialNotifications?: Notification[]
}

export default function NotificationBell({
  initialNotifications = [],
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  // استخدام البيانات الأولية إذا توفرت، иначе استخدام hook
  const {
    notifications: hookNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // استخدام البيانات الأولية إذا تم تمريرها، иначе استخدام بيانات hook
  const notifications =
    initialNotifications.length > 0 ? initialNotifications : hookNotifications

  return (
    <div className="relative">
      <NotificationIcon
        unreadCount={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  )
}
