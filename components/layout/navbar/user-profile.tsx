"use client"

import * as React from "react"
import { BellIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { cn } from "@/lib/utils"

interface UserProfileProps {
  className?: string
  user: CurrentUser | null
}

export default function UserProfile({ user, className }: UserProfileProps) {
  if (!user) return null

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "User"

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* أفاتار بحجم متناسق */}
        <Avatar className="shrink-0 size-14">
          <AvatarImage
            src={user.profile_image || undefined}
            alt={displayName}
          />
          <AvatarFallback className="p-2">
            <UserIcon className="size-full text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* الحاوية النصية للمستخدم */}
        <div className="flex min-w-0 flex-col items-start justify-center">
          <p
            className="w-full truncate text-xs font-semibold text-foreground"
            title={displayName}
          >
            {displayName}
          </p>

          {user.email && (
            <p
              className="w-full truncate text-[11px] text-muted-foreground"
              title={user.email}
            >
              {user.email}
            </p>
          )}

          {user.role === "admin" && (
            <span className="mt-1 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 ps-1">
        <NotificationButton />
      </div>
    </div>
  )
}

function NotificationButton() {
  return (
    <div className="relative">
      {/* نقطة الإشعار باستخدام أبعاد الاتجاه الحديثة inset-e */}
      <span className="absolute -inset-e-0.5 -top-0.5 z-10 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
      <CustomButton
        type="button"
        variant="secondary"
        size="icon"
        className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <BellIcon className="size-4" />
      </CustomButton>
    </div>
  )
}
