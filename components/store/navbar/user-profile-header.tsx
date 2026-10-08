"use client"


import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/lib/context/user-context"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { cn } from "@/lib/utils"
import { NotificationPopover } from "@/components/notifications/notification-popover.tsx"


interface UserProfileHeaderProps {
  className?: string
  initialNotifications?: NotificationRecord[]
  initialUnreadCount?: number
  showNotifications?: boolean
  showAvatar?: boolean
}

export function UserProfileHeader({
  className,
  initialNotifications = [],
  initialUnreadCount = 0,
  showNotifications = false,
  showAvatar = true,
}: UserProfileHeaderProps) {
  const { user } = useUser()

  if (!user) return null

  // استخراج المعرف من البريد
  const username = user.email ? user.email.split("@")[0] : "user"

  // دمج المعرف مع الدور بصيغة @handle/ROLE
  const handleWithRole = user.role
    ? `@${username}/${user.role.toUpperCase()}`
    : `@${username}`

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* إظهار الصورة إذا كانت مطلوبة فقط (في الموبايل مثلاً) */}
        {showAvatar && (
          <Avatar className="size-10 shrink-0 border-0 shadow-none ring-0">
            <AvatarImage src={user.avatar} alt={user.name} />
          </Avatar>
        )}

        {/* معلومات المستخدم */}
        <div className="flex min-w-0 flex-col justify-center">
          <p
            className="w-full truncate text-xs leading-tight font-semibold text-foreground"
            title={user.name}
          >
            {user.name}
          </p>

          <p
            className="mt-0.5 w-full truncate font-mono text-[11px] leading-tight text-muted-foreground"
            title={handleWithRole}
          >
            {handleWithRole}
          </p>
        </div>
      </div>

      {showNotifications && (
        <div className="shrink-0 ps-1">
          <NotificationPopover
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
            currentUserId={user.id}
          />
        </div>
      )}
    </div>
  )
}
