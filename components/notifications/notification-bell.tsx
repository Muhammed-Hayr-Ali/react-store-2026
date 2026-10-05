"use client"

import { BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NotificationBellProps {
  unreadCount: number
  onClick?: () => void
}

export function NotificationBell({
  unreadCount,
  onClick,
}: NotificationBellProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label="Notifications"
    >
      <BellIcon className="size-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 flex size-5 animate-pulse items-center justify-center rounded-full p-0 text-[10px] font-bold"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
