import { cn } from "@/lib/utils"

import type { Notification } from "./types"
import { NotificationItem } from "./NotificationItem"

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-md border border-gray-100 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
        <h3 className="font-semibold text-gray-700">الإشعارات</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-blue-600 hover:underline"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">
            لا توجد إشعارات جديدة
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  )
}
