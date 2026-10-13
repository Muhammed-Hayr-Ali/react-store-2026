"use client"

import * as React from "react"
import { UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/lib/context/user-context"
import { cn } from "@/lib/utils"

interface UserProfileHeaderProps {
  className?: string
  showAvatar?: boolean
}

export function UserProfileHeader({
  className,
  showAvatar = true,
}: UserProfileHeaderProps) {
  const { user } = useUser()

  if (!user) return null

  const userHandle = user.email ? user.email.split("@")[0] : "user"
  const userTag = user.role
    ? `@${userHandle}/${user.role.toUpperCase()}`
    : `@${userHandle}`

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showAvatar && (
          <Avatar className="size-10 shrink-0 border-0 shadow-none ring-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-[10px]">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex min-w-0 flex-col justify-center">
          <p
            className="w-full truncate text-xs leading-tight font-semibold text-foreground"
            title={user.name}
          >
            {user.name}
          </p>

          <p
            className="mt-0.5 w-full truncate font-mono text-[11px] leading-tight text-muted-foreground"
            title={userTag}
          >
            {userTag}
          </p>
        </div>
      </div>
    </div>
  )
}
