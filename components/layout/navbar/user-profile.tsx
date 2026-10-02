"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CustomButton } from "@/components/ui/custom-button"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

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
        "flex w-full items-center justify-between gap-3 p-1",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* أفاتار بحجم متناسق لا يضغط النصوص */}
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={user.profile_image} alt={displayName} />
          <AvatarFallback className="p-2">
            <User className="size-full text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* الحاوية النصية تمتد تلقائياً بحسب طول النص */}
        <div className="flex flex-col items-start justify-center">
          <p
            className="max-w-[240px] truncate text-sm font-semibold whitespace-nowrap text-foreground"
            title={displayName}
          >
            {displayName}
          </p>

          {user.email && (
            <p
              className="max-w-[240px] truncate text-xs whitespace-nowrap text-muted-foreground"
              title={user.email}
            >
              {user.email}
            </p>
          )}

          {user.role === "admin" && (
            <span className="mt-0.5 inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
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
      <div className="absolute top-0 right-0 z-50 size-2 rounded-full bg-green-500 rtl:right-auto rtl:left-0 dark:bg-green-400" />
      <CustomButton
        variant="secondary"
        size="icon"
        className="size-8 p-1.5"
        asChild
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="size-4 fill-foreground"
        >
          <path d="M168,224a8,8,0,0,1-8,8H96a8,8,0,1,1,0-16h64A8,8,0,0,1,168,224Zm53.85-32A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192ZM208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z"></path>
        </svg>
      </CustomButton>
    </div>
  )
}
