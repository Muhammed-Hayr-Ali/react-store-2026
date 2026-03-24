import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"

import type { Notification } from "./types"

interface NotificationIconProps {
  unreadCount: number
  onClick: () => void
}

export function NotificationIcon({ unreadCount, onClick }: NotificationIconProps) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      aria-label="Notifications"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white",
            unreadCount > 9 && "w-6 text-[10px]"
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )
}
