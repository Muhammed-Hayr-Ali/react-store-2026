import { cn } from "@/lib/utils"

import type { Notification } from "./types"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50",
        !notification.is_read && "bg-blue-50/50"
      )}
    >
      <div className="flex items-start justify-between">
        <h4
          className={cn(
            "text-sm font-medium",
            !notification.is_read ? "text-gray-900" : "text-gray-600"
          )}
        >
          {notification.title}
        </h4>
        {!notification.is_read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
      <time
        className="mt-2 block text-[10px] text-gray-400"
        dateTime={notification.created_at}
      >
        {new Date(notification.created_at).toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
    </div>
  )
}
