"use client"

import React from "react"
import { UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useUser } from "@/lib/context/user-context"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { cn } from "@/lib/utils"
import { NotificationPopover } from "@/components/notifications/notification-popover.tsx"

interface UserProfileHeaderProps {
  className?: string
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
}

export function UserProfileHeader({
  className,
  initialNotifications,
  initialUnreadCount,
}: UserProfileHeaderProps) {
  const { user } = useUser()

  if (!user) return null

  return (
    <div className={cn("flex w-full items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="p-1.5">
            <UserIcon className="size-full text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col items-start justify-center">
          <p
            className="w-full truncate text-xs font-semibold text-foreground"
            title={user.name}
          >
            {user.name}
          </p>
          <p
            className="w-full truncate text-[11px] text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
          {user.role === "admin" && (
            <span className="mt-0.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 ps-1">
        <NotificationPopover
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}